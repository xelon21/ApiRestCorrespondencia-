import sql from 'mssql';


const dbSettings = {
    user:  'sa', 
    password:  'soinco123',
    server:  '10.0.0.16',
    database: 'MAINDB',
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