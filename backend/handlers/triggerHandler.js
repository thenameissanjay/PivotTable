const db = require('../connection');

const updateCredits = (req, res) => {
  const { userID, operation, message } = req.body;

  const getCreditSql = `SELECT operation_credit FROM credit_price WHERE operation = ?`;
  db.query(getCreditSql, [operation], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Operation not found' });

    const creditCharges = results[0].operation_credit;

    const updateUserSql = `UPDATE user SET credit = credit - ? WHERE id = ?`;
    db.query(updateUserSql, [creditCharges, userID], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // Step 1: Fetch updated remaining credit
      const getUpdatedCreditSql = `SELECT credit FROM user WHERE id = ?`;
      db.query(getUpdatedCreditSql, [userID], (err, creditResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const remainingCredit = creditResult[0].credit;

        // Step 2: Format date & insert into track_credit
        const now = new Date();
        const formattedDateTime = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const insertLogSql = `INSERT INTO track_credit (user_id, date_time, operation, message, credit_balance) VALUES (?, ?, ?, ?, ?)`;
        db.query(insertLogSql, [userID, formattedDateTime, operation, message, remainingCredit], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          return res.json({
            success: true,
            message: 'Credit updated and operation logged successfully',
            remainingCredit,
          });
        });
      });
    });
  });
};

module.exports = { updateCredits };
