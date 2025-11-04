import random from 'random';

export function configurarInputFecha() {
    const fechaInput = document.getElementById('fechaVisita');
    const hoy = new Date();
    const unMesAdelante = new Date(hoy);
    unMesAdelante.setMonth(unMesAdelante.getMonth() + 1);
    
    // Formatear fechas para el input (YYYY-MM-DD)
    const fechaMinima = hoy.toISOString().split('T')[0];
    const fechaMaxima = unMesAdelante.toISOString().split('T')[0];
    
    fechaInput.setAttribute('min', fechaMinima);
    fechaInput.setAttribute('max', fechaMaxima);
    
    // Deshabilitar los lunes en el calendario
    // No se genera ni asocia ningún datalist, solo se mantiene el calendario nativo

    // Agregar validación más estricta
    fechaInput.addEventListener('input', validarFechaEnTiempoReal);
    fechaInput.addEventListener('blur', validarFechaEnTiempoReal);
    fechaInput.addEventListener('keydown', bloquearTeclasInvalidas);
}

export function bloquearTeclasInvalidas(e) {
    // Permitir teclas de navegación y control
    const teclasPermitidas = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Tab', 'Enter', 'Escape', 'Home', 'End'
    ];
    
    if (teclasPermitidas.includes(e.key)) {
        return true;
    }
    
    // Para teclas numéricas y guiones, validar después
    if (/[0-9\-]/.test(e.key)) {
        return true;
    }
    
    // Bloquear cualquier otra tecla
    e.preventDefault();
    return false;
}

export function validarFechaEnTiempoReal() {
    const fechaInput = document.getElementById('fechaVisita');
    
    // Si está vacío, no mostrar error ni borde
    if (!fechaInput.value) {
        fechaInput.setCustomValidity('');
        fechaInput.style.borderColor = '';
        return;
    }

    // Validar la fecha seleccionada sin mostrar alerts
    if (!validarFecha(false)) {
        // Solo mostrar borde rojo si el usuario ya ingresó algo
        if (fechaInput.value) {
            fechaInput.style.borderColor = '#ff0000';
            fechaInput.setCustomValidity('Fecha no válida');
        } else {
            fechaInput.style.borderColor = '';
            fechaInput.setCustomValidity('');
        }

        // Si es lunes, mostrar solo un toast y limpiar el campo
        if (fechaInput.value) {
            const fecha = new Date(fechaInput.value + 'T00:00:00');
            if (fecha.getDay() === 1) {
                mostrarMensajeError("Los lunes el parque permanece cerrado. Por favor, seleccione otro día.");
                fechaInput.value = '';
                fechaInput.style.borderColor = '';
                fechaInput.setCustomValidity('');
                fechaInput.focus();
                return;
            }
        }

        // Limpiar el campo después de un breve delay si sigue siendo inválido (no lunes)
        setTimeout(() => {
            if (fechaInput.value && !validarFecha(false)) {
                const fechaOriginal = fechaInput.value;
                const fecha = new Date(fechaOriginal + 'T00:00:00');

                let mensaje = "Fecha no válida: ";

                // Determinar qué regla se violó
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const unMes = new Date(hoy);
                unMes.setMonth(unMes.getMonth() + 1);

                if (fecha < hoy) {
                    mensaje += "no se permiten fechas pasadas";
                } else if (fecha > unMes) {
                    mensaje += "máximo 1 mes de anticipación";
                } else if ((fecha.getDate() === 25 && fecha.getMonth() === 11) || 
                          (fecha.getDate() === 1 && fecha.getMonth() === 0)) {
                    mensaje += "cerrado en fechas especiales";
                }

                mostrarMensajeError(mensaje);
                fechaInput.value = '';
                fechaInput.style.borderColor = '';
                fechaInput.setCustomValidity('');
                fechaInput.focus();
            }
        }, 1500);
    } else {
        // Fecha válida
        fechaInput.style.borderColor = '#28a745';
        fechaInput.setCustomValidity('');
    }
}

export function mostrarMensajeError(mensaje) {
    Toastify({
        text: mensaje,
        duration: 4000,
        close: true,
        gravity: "top", 
        position: "center", // Centrado arriba
        stopOnFocus: true,
        style: {
            background: "linear-gradient(135deg, #ff4444, #cc3333)",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "600",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
        },
        onClick: function(){} 
    }).showToast();
}

export function mostrarMensajeExito(mensaje) {
    Toastify({
        text: mensaje,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center", // Centrado arriba
        stopOnFocus: true,
        style: {
            background: "linear-gradient(135deg, #3E8914, #134611)", // Verde medio a verde oscuro
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "600",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(19, 70, 17, 0.3)"
        },
    }).showToast();
}

export function mostrarMensajeInfo(mensaje) {
    Toastify({
        text: mensaje,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center", // Centrado arriba
        stopOnFocus: true,
        style: {
            background: "linear-gradient(135deg, #3DA35D, #96E072)", // Verde pigmento a verde claro
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "600",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(61, 163, 93, 0.3)"
        },
    }).showToast();
}

export function mostrarMensajeBienvenida(mensaje) {
    Toastify({
        text: mensaje,
        duration: 4000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(135deg, #96E072, #E8FCCF)", // Verde claro a verde nyanza
            color: "#134611", // Texto verde oscuro
            fontFamily: "Montserrat, sans-serif",
            fontWeight: "700",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(150, 224, 114, 0.3)",
            border: "2px solid #3DA35D"
        },
    }).showToast();
}

export function validarFecha(mostrarError = true) {
    const fechaInput = document.getElementById('fechaVisita');
    const fechaSeleccionada = new Date(fechaInput.value + 'T00:00:00'); // Evita problemas de zona horaria
    const fechaActual = new Date();
    
    // Resetear hora para comparar solo fechas
    fechaActual.setHours(0, 0, 0, 0);
    fechaSeleccionada.setHours(0, 0, 0, 0);
    
    // Validar que se haya seleccionado una fecha
    if (!fechaInput.value) {
        if (mostrarError) mostrarMensajeError("Por favor, seleccione una fecha de visita.");
        return false;
    }
    
    // Validar que no sea una fecha anterior a hoy
    if (fechaSeleccionada < fechaActual) {
        if (mostrarError) mostrarMensajeError("No se puede seleccionar una fecha anterior a hoy.");
        return false;
    }
    
    // Validar que no sea más de 1 mes en el futuro
    const unMesAdelante = new Date(fechaActual);
    unMesAdelante.setMonth(unMesAdelante.getMonth() + 1);
    
    if (fechaSeleccionada > unMesAdelante) {
        if (mostrarError) mostrarMensajeError("No se puede seleccionar una fecha con más de 1 mes de anticipación.");
        return false;
    }
    
    // Validar que no sea lunes (0=domingo, 1=lunes, ..., 6=sábado)
    if (fechaSeleccionada.getDay() === 1) {
        if (mostrarError) mostrarMensajeError("Los lunes el parque permanece cerrado. Por favor, seleccione otro día.");
        return false;
    }
    
    // Validar fechas especiales cerradas (25/12 y 01/01)
    const dia = fechaSeleccionada.getDate();
    const mes = fechaSeleccionada.getMonth() + 1; // getMonth() devuelve 0-11
    
    if ((dia === 25 && mes === 12) || (dia === 1 && mes === 1)) {
        if (mostrarError) mostrarMensajeError("El parque permanece cerrado el 25 de diciembre y 1 de enero. Por favor, seleccione otra fecha.");
        return false;
    }
    
    return true; // Fecha válida
}

export function obtenerCantidad(){
    return Number(document.getElementById('cantidadEntradas').value);
}

export function obtenerGrilla() {
    return document.getElementById("grillaVisitantes");
}

export function validarCantidadEntradas() {
    const cantidad = obtenerCantidad();

    const inputCantidad = document.getElementById('cantidadEntradas');

    if (!inputCantidad.value) {
        inputCantidad.style.borderColor = '';
        return false;
    }

    if (isNaN(cantidad) || cantidad <= 0) {
        inputCantidad.style.borderColor = '#ff0000';
        mostrarMensajeError("Por favor, ingrese una cantidad válida de entradas.");
        return false;
    }

    if (cantidad > 10) {
        inputCantidad.style.borderColor = '#ff0000';
        mostrarMensajeError("No se pueden comprar más de 10 entradas.");
        return false;
    }

    inputCantidad.style.borderColor = '#28a745';
    return true; // si es válido
}

export function generarGrilla() {
    const cantidad = obtenerCantidad();
    const tabla = obtenerGrilla();
    const tbody = tabla.querySelector('tbody');
    const thead = tabla.querySelector('thead');

    // limpiar solo el cuerpo (no tocar el thead)
    tbody.innerHTML = '';

    // Mostrar encabezado solo si hay visitantes
    if (cantidad > 0) {
        if (thead) thead.style.display = '';
        for (let i = 1; i <= cantidad; i++) {
            const tr = document.createElement('tr');
            tr.style.verticalAlign = 'middle';

            // Visitante
            const tdV = document.createElement('td');
            tdV.textContent = `Visitante ${i}`;
            tdV.style.padding = '8px 4px';
            tr.appendChild(tdV);

            // Edad
            const tdE = document.createElement('td');
            tdE.style.padding = '8px 4px';
            const inputEdad = document.createElement('input');
            inputEdad.type = 'number';
            inputEdad.min = '1';
            inputEdad.max = '99';
            inputEdad.id = `edad${i}`;
            inputEdad.name = `edad${i}`;
            inputEdad.style.width = '70px';
            inputEdad.style.marginRight = '8px';
            // Validación en tiempo real para edad
            inputEdad.addEventListener('input', function() {
                if (Number(inputEdad.value) > 99) {
                    inputEdad.value = 99;
                    mostrarMensajeError('La edad máxima permitida es 99.');
                }
                actualizarTotal();
            });
            tdE.appendChild(inputEdad);
            tr.appendChild(tdE);

            // Tipo
            const tdT = document.createElement('td');
            tdT.style.padding = '8px 4px';
            const selectTipo = document.createElement('select');
            selectTipo.id = `tipo${i}`;
            selectTipo.name = `tipo${i}`;
            selectTipo.innerHTML = `
                <option value="">Seleccione</option>
                <option value="general">General</option>
                <option value="vip">VIP</option>
            `;
            tdT.appendChild(selectTipo);
            tr.appendChild(tdT);

            // Botón eliminar (tachito)
            const tdEliminar = document.createElement('td');
            tdEliminar.style.textAlign = 'center';
            tdEliminar.style.width = '40px';
            const btnEliminar = document.createElement('button');
            btnEliminar.type = 'button';
            btnEliminar.innerHTML = '🗑️';
            btnEliminar.title = 'Eliminar visitante';
            btnEliminar.style.background = 'none';
            btnEliminar.style.border = 'none';
            btnEliminar.style.cursor = 'pointer';
            btnEliminar.style.fontSize = '1.2em';
            btnEliminar.addEventListener('click', function() {
                tr.remove();
                actualizarTotal();
            });
            tdEliminar.appendChild(btnEliminar);
            tr.appendChild(tdEliminar);

            selectTipo.addEventListener('change', actualizarTotal);

            tbody.appendChild(tr);
        }
    } else {
        if (thead) thead.style.display = 'none';
    }

    actualizarTotal();
}

export function validarVisitantes() {
  const cantidad = obtenerCantidad();
  const tbody = obtenerGrilla().querySelector('tbody');
  const filas = Array.from(tbody.querySelectorAll('tr'));
  let completados = 0;

  for (let i = 0; i < cantidad; i++) {
    const fila = filas[i];
    if (!fila) break;
    const edad = fila.cells[1].querySelector('input').value;
    const tipo = fila.cells[2].querySelector('select').value;
    if (edad && tipo) completados++;
  }

  if (completados === cantidad) return true;

  mostrarMensajeError("Debe completar los datos de todos los visitantes según la cantidad de entradas ingresadas.");
  return false;
}

export function obtenerGrillaActualizada() {
  const tbody = obtenerGrilla().querySelector('tbody');
  const filas = Array.from(tbody.querySelectorAll('tr'));
  const visitantes = [];

  filas.forEach((fila) => {
    const edad = Number(fila.cells[1].querySelector('input').value);
    const tipo = fila.cells[2].querySelector('select').value;
    if (!edad || !tipo) return;
    visitantes.push({ edad, tipo });
  });

  return visitantes;
}


export function calcularTotal() { // solo se encarga de sumar precios y calcular descuentos (no toca el HTML)
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

export function actualizarTotal() {
    const total = calcularTotal();
    document.getElementById("total").textContent = `Total: $${total}`;
}

document.addEventListener("DOMContentLoaded", () => {
    // Configurar límites de fecha
    configurarInputFecha();

    // Toast de bienvenida
    setTimeout(() => {
        mostrarMensajeBienvenida("¡Bienvenido a EcoHarmony Park! 🌳 Selecciona tu fecha de visita para comenzar.");
    }, 500);

    // Quitar borde rojo nativo de required al inicio
    const fechaInput = document.getElementById('fechaVisita');
    const cantidadInput = document.getElementById('cantidadEntradas');
    const btnGenerar = document.getElementById('btnGenerar');
    fechaInput.classList.remove('input-error');
    cantidadInput.classList.remove('input-error');
    fechaInput.style.borderColor = '';
    cantidadInput.style.borderColor = '';

    // Deshabilitar el botón generar grilla al inicio
    btnGenerar.disabled = true;

    // Habilitar/deshabilitar el botón según la cantidad ingresada
    cantidadInput.addEventListener('input', () => {
        const val = Number(cantidadInput.value);
        if (!isNaN(val) && val > 0 && val <= 10) {
            btnGenerar.disabled = false;
        } else {
            btnGenerar.disabled = true;
        }
        actualizarTotal();
    });

    btnGenerar.addEventListener("click", () => {
        if (validarCantidadEntradas()) {
            generarGrilla();
            mostrarMensajeInfo("✅ Grilla de visitantes generada correctamente");
        }
    });

    // Valida que se hayan completado los datos
    document.getElementById("btnValidar")?.addEventListener("click", validarVisitantes); //mpdfi

    // Validar formulario completo al enviar
    document.getElementById("formCompra").addEventListener("submit", async (e) => {
    // Prevenir validación nativa y feedback visual del navegador
    e.preventDefault();
    e.stopPropagation();

    let valido = true;

    const fechaInput = document.getElementById('fechaVisita');
    const cantidadInput = document.getElementById('cantidadEntradas');

    // Validar fecha
    if (!validarFecha()) {
        fechaInput.style.borderColor = '#ff0000';
        valido = false;
    } else {
        fechaInput.style.borderColor = '#28a745';
    }

    // Validar cantidad de entradas
    if (!validarCantidadEntradas()) {
        cantidadInput.style.borderColor = '#ff0000';
        valido = false;
    } else {
        cantidadInput.style.borderColor = '#28a745';
    }

    // Validar datos de visitantes
    if (!validarVisitantes()) {
        valido = false;
    }

    // Validar forma de pago
    const formaPago = document.querySelector('input[name="pago"]:checked');
    if (!formaPago) {
        mostrarMensajeError("Por favor, seleccione una forma de pago.");
        valido = false;
    }

    // Si todas las validaciones pasan → ENVIAR MAIL
    if (valido) {
        const btnComprar = document.getElementById('btnComprar');
        // Si es Mercado Pago, mostrar mensaje de "Pagando..." en el botón y delay
        if (formaPago.value === 'tarjeta') {
            const originalText = btnComprar.textContent;
            btnComprar.textContent = 'Pagando...';
            btnComprar.disabled = true;
            await new Promise(resolve => setTimeout(resolve, 2000));
            btnComprar.textContent = originalText;
            btnComprar.disabled = false;
        }
        try {
            const ok = await enviarEmailResumenHardcodeado();
            if (!ok) {
                mostrarMensajeError("No pudimos enviar el email. Probá de nuevo.");
                return;
            }
            mostrarMensajeExito("📧 Resumen enviado por email.");
            mostrarMensajeExito("🎉 ¡Compra realizada exitosamente! ¡Te esperamos! 🌿");

            // Limpiar campos y grilla
            e.target.reset();
            document.getElementById("grillaVisitantes").querySelector('tbody').innerHTML = "";
            document.getElementById("grillaVisitantes").querySelector('thead').style.display = 'none';
            document.getElementById("total").textContent = "Total: $0";
        } catch (err) {
            console.error(err);
            mostrarMensajeError("Ocurrió un error al enviar el email.");
        }
    }
    });


    // Validar fecha cuando cambie el input de fecha
    fechaInput.addEventListener("change", validarFecha);
});

export function construirResumenCompra() {
  const randomGenerador = random.int(1, 9000);  
  const fecha = document.getElementById("fechaVisita").value;
  const cantidad = obtenerCantidad();
  const visitantes = obtenerGrillaActualizada();
  const total = calcularTotal();

  const lineas = visitantes.map((v, i) =>
    `Visitante ${i+1}: edad ${v.edad}, tipo ${v.tipo.toUpperCase()}`
  ).join('\n');

  return [
    `EcoHarmony Park - Resumen de compra`,
    `Hola Marcos Pomenich! Gracias por elegir EcoHarmony Park. Aquí tienes el resumen de tu compra:`,
    `Código de compra: ${randomGenerador}`,
    `Fecha de visita: ${fecha}`,
    `Entradas: ${cantidad}`,
    `Detalle:`,
    lineas || '(sin detalle)',
    `Total: $${total}`
  ].join('\n');
}

export async function enviarEmailResumenHardcodeado() {
  const resumen = construirResumenCompra();
  const resp = await fetch('http://localhost:3000/api/send-email', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      subject: 'Tus entradas de EcoHarmony Park',
      text: resumen
    })
  });
  return resp.ok;
}
// Faltan las validaciones TDD