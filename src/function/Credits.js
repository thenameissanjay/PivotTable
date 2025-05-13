import axios from 'axios';

const Credits = async (userID, operation, message)=>{
    try {
        const response = await axios.post(`http://localhost:8080/api/trigger/updateCredits`, 
            {
                userID: userID, 
                operation:operation,
                message: message

            }
        )
       
    } catch (error) {
        console.log(error)
    }
    
}

export default Credits;