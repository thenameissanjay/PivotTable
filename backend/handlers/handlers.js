const db = require('../connection')

const getUser = (req, res)=>{
    const {id} = req.params;
    const sql =`select id, name , credit from user where id = ?
    `

    db.query(sql, [id], (err, results)=>{
        if(err) return console.log(err)
            console.log(results)
     
        return res.json(results)
    })
    
}


const getTrack =(req, res)=>{
     const {id} = req.params;

     const sql = `
     SELECT * 
     FROM track_credit 
     LEFT JOIN credit_price 
       ON track_credit.operation = credit_price.operation 
     LEFT JOIN user 
       ON track_credit.user_id = user.id 
     WHERE track_credit.user_id = ?
     ORDER BY STR_TO_DATE(track_credit.date_time, '%d-%m-%Y %H:%i:%s') DESC
   `;
   

   db.query(sql, [id], (err, results)=>{
        if(err){
            return console.log(err)
        }
        console.log(results)
        return res.json(results)
     })
}

module.exports = {
    getUser,
    getTrack
}