import sql from 'mssql';

const dbSettings = {
    user: 'sa', 
    password: '.Blackheart5469', 
    server: 'localhost',
    database: 'Correspondencia',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}

export async function getConnection(){

    try{
        const pool = await sql.connect(dbSettings);     
        return pool;

    }catch ( error ) {
        console.error(error);
    }
}

export { sql };