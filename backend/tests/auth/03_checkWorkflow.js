const testFinalFlow = async () => {
    try {
        console.log('--- TEST DE ESCRITORIO: FLUJO COMPLETO ---');
        
        // 1. Simulación de Workflow llamando al DAO
        const rawUser = await registerUserDao({
            name: "Luis DTO Test",
            email: `dto-${Date.now()}@test.com`,
            password: "password123"
        });

        // 2. Aplicación del DTO (Limpieza de datos privados)
        const safeUser = userResponseDto(rawUser);

        // 3. El Controller recibe safeUser y consulta a Governance
        const response = authResponses.registerSuccess(safeUser);

        // 4. Salida final hacia el Router
        console.log('STATUS FINAL:', response.status);
        console.log('BODY FILTRADO:', response.body);
        
        // Verificación de seguridad
        if (response.body.user.password || response.body.user.rid || response.body.user._id) {
            console.error('ALERTA: Fuga de datos detectada en el DTO');
        } else {
            console.log('SEGURIDAD: DTO aplicado correctamente. Datos privados omitidos.');
        }

    } catch (error) {
        console.error('Error en el flujo:', error.message);
    }
};