const testIntegratedQueries = async () => {
    try {
        const email = `hybrid-test-${Date.now()}@test.com`;

        // 1. Usamos authQueries para la persistencia
        console.log('--- PASO 1: Creando Identidad ---');
        const createdUser = await authQueries.createUser({
            name: 'Luis Integración',
            email,
            password: 'password123'
        });
        console.log(`Usuario creado. SID: ${createdUser.sid}`);

        // 2. Usamos userQueries para simular una consulta de perfil (pública)
        console.log('\n--- PASO 2: Consultando Perfil Público ---');
        const publicProfile = await userQueries.findUserBySid(createdUser.sid);
        
        if (publicProfile) {
            console.log('Perfil encontrado exitosamente:');
            console.log(`Nombre: ${publicProfile.name}`);
            console.log(`Email: ${publicProfile.email}`);
            console.log(`Role: ${publicProfile.role}`);
            // El password no debería venir aquí por el .select() de userQueries
            console.log(`¿Trae password?: ${!!publicProfile.password}`); 
        }

    } catch (error) {
        console.error('Error en la prueba integrada:', error.message);
    }
};