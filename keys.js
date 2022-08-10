module.exports = {

    database: {
        host: process.env.DB_CNH,
        user: process.env.DB_CNU,
        password: process.env.DB_CNP,
        database: process.env.DB_CND, 
    },
    sqlServerDatabase: {
        
        user:  process.env.DB_CNU, 
        password:  process.env.DB_CNP,
        server:  process.env.DB_CNS,
        database: process.env.DB_CND,
    }

}