//Crear usuarios aleatoriamente

const testDB = async () => {
    try {
        const tempEmail = `debug-${Date.now()}@test.com`;
        
        // 1. Intento de creación directa
        const testUser = await Users.create({
            name: 'Debug User',
            email: tempEmail,
            password: 'password_seguro_123',
            role: 'DOWNLOADER'
        });

        console.log('// --- RESULTADO DE PRUEBA DE ESCRITORIO --- //');
        console.log('Usuario creado con éxito');
        console.log('ID Mongo:', testUser._id);
        console.log('RID (Privado):', testUser.rid);
        console.log('SID (Público):', testUser.sid);
        console.log('Role:', testUser.role);
        console.log('// ---------------------------------------- //');

    } catch (error) {
        console.error('// --- ERROR EN PRUEBA DE ESCRITORIO --- //');
        console.error(error.message);
    }
};