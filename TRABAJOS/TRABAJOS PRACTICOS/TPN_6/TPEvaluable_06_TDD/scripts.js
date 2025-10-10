function validarFecha() {} // completar (deberia validar que se sekeccione hasta 1 mes de anticipacion
                         // y que no se ingresen fechas anteriores a la actual)

function obtenerCantidad(){
    return Number(document.getElementById('cantidadEntradas').value);
}

function obtenerGrilla() {
    return document.getElementById("grillaVisitantes");
}

function validarCantidadEntradas() {
    const cantidad = obtenerCantidad();

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Por favor, ingrese una cantidad válida de entradas.");
        return false;
    }

    if (cantidad > 10) {
        alert("No se pueden comprar más de 10 entradas.");
        return false;
    }

    return true; // si es válido
}

function generarGrilla() { 
    const cantidad = obtenerCantidad();
    const tabla = obtenerGrilla();
   
    while (tabla.rows.length > 1) { //limpia la grilla
        tabla.deleteRow(1);
    }

    // Creamos las filas necesarias
    for (let i = 1; i <= cantidad; i++) {
        const fila = tabla.insertRow();
        
        // Columna Visitante
        const celdaVisitante = fila.insertCell();
        celdaVisitante.textContent = `Visitante ${i}`;

        // Columna Edad
        const celdaEdad = fila.insertCell();
        const inputEdad = document.createElement("input");
        inputEdad.type = "number";
        inputEdad.min = "1";
        inputEdad.max = "99";
        inputEdad.id = `edad${i}`;         // se asigna el ID dinámico
        inputEdad.name = `edad${i}`;
        inputEdad.type = "number";
        celdaEdad.appendChild(inputEdad);

        // Columna Tipo de entrada
        const celdaTipo = fila.insertCell();
        const selectTipo = document.createElement("select");
        selectTipo.id = `tipo${i}`;        // también le das un ID único
        selectTipo.name = `tipo${i}`;
        selectTipo.innerHTML = `
            <option value="">Seleccione</option>
            <option value="general">General</option>
            <option value="vip">VIP</option>
        `;
        celdaTipo.appendChild(selectTipo);
        
        // Agregar listeners para recalcular automáticamente
        inputEdad.addEventListener("input", actualizarTotal);
        selectTipo.addEventListener("change", actualizarTotal);
    }

     // Calcula el total inicial (por si ya había datos)
    actualizarTotal();

}

function validarVisitantes() { //deberia validar que se hayan completado los datos de todos los visitantes
    const tabla = obtenerGrilla();
    const cantidad = obtenerCantidad();
    let completados = 0;

    for (let i = 1; i <= cantidad; i++) {
        const fila = tabla.rows[i];
        const edad = fila.cells[1].querySelector("input").value;
        const tipo = fila.cells[2].querySelector("select").value;

        if (edad && tipo) {
            completados++;
        }
    }    
    
    if (completados === cantidad) {
        console.log("Todos los visitantes completaron sus datos.");
    return true;
    } else {
        console.warn("⚠️ Datos incompletos o incorrectos.");
        mostrarMensajeError("Debe completar los datos de todos los visitantes según la cantidad de entradas ingresadas.");
        return false;
    }

}

function obtenerGrillaActualizada() { //guarda datos de visitantes en un array
    const tabla = obtenerGrilla();
    const cantidad = obtenerCantidad();
    const visitantes = [];

    for (let i = 1; i <= cantidad; i++) {
        const fila = tabla.rows[i];
        console.log(fila)
        const edad = Number(fila.cells[1].querySelector("input").value);
        const tipo = fila.cells[2].querySelector("select").value;

        if (!edad || !tipo) continue; // se omiten filas incompletas

        visitantes.push({ edad, tipo });
    }

    return visitantes;
}

function calcularTotal() { // solo se encarga de sumar precios y calcular descuentos (no toca el HTML)
    const visitantes = obtenerGrillaActualizada();
    let total = 0;

    for (const v of visitantes) {
        if (v.edad <= 3) continue;

        let precio = v.tipo === "vip" ? 10000 : 5000; // probar con "VIP por las dudas"
        if (v.edad <= 15 || v.edad >= 60) precio *= 0.5;

        total += precio;
    }

    return total;
}

function actualizarTotal() {
    const total = calcularTotal();
    document.getElementById("total").textContent = `Total: $${total}`;
}


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnGenerar").addEventListener("click", () => {
        if (validarCantidadEntradas()) { //primero valida la cant. de entradas para asi generar grilla
            generarGrilla();
        }
    });

    // Valida que se hayan completado los datos
    document.getElementById("btnValidar").addEventListener("click", validarVisitantes); //mpdfi

    // recalcular total si se cambia la cantidad de entradas
    document.getElementById("cantidadEntradas").addEventListener("input", actualizarTotal);

});

// Faltan las validaciones TDD

