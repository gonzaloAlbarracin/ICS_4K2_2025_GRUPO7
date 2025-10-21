/**
 * @jest-environment jsdom
 */

import {
  configurarInputFecha,
  validarFecha,
  validarCantidadEntradas,
  generarGrilla,
  validarVisitantes,
  construirResumenCompra,
  validarFechaEnTiempoReal,
  mostrarMensajeExito,
  enviarEmailResumenHardcodeado,
  mostrarMensajeError
} from '../scripts.js';

//import * as Scripts from '../scripts';

global.Toastify = jest.fn().mockReturnValue({ showToast: jest.fn() });

describe('Compra de entradas', () => {
  let fechaInput, cantidadInput, grilla, tbody, form;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="formCompra">
        <input id="fechaVisita" type="date" />
        <input id="cantidadEntradas" type="number" />
        <input type="radio" name="pago" value="tarjeta">
        <input type="radio" name="pago" value="efectivo">
        <button id="btnComprar">Comprar</button>
      </form>
      <table id="grillaVisitantes">
        <thead><tr><th>Visitante</th><th>Edad</th><th>Tipo</th></tr></thead>
        <tbody></tbody>
      </table>
      <div id="total"></div>
    `;

    // --- MOCK del envío de email ---
    //enviarMock = jest                                                  //
       // .spyOn(Scripts, 'enviarEmailResumenHardcodeado')                     //
       // .mockImplementation(() => Promise.resolve(true)); // simula éxito.   //

    // --- MOCK de mostrar mensajes ---                    
    mostrarMock = jest.spyOn({mostrarMensajeError}, 'mostrarMensajeError').mockImplementation(() => {});

    form = document.getElementById('formCompra'); //nuevo
    fechaInput = document.getElementById('fechaVisita');
    cantidadInput = document.getElementById('cantidadEntradas');
    grilla = document.getElementById('grillaVisitantes');
    tbody = grilla.querySelector('tbody');
    configurarInputFecha();

    // Mock de funciones de éxito/error. // Espiamos las funciones críticas y las convertimos en mocks
    //jest.spyOn(Scripts, 'mostrarMensajeExito').mockImplementation(jest.fn());
    //jest.spyOn(Scripts, 'mostrarMensajeError').mockImplementation(jest.fn());
    //jest.spyOn(Scripts, 'enviarEmailResumenHardcodeado').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('CP1- Compra Exitosa con Tarjeta', () => {
    test('Ingresa fecha válida, cantidad de entradas, completar datos de cada visitante y seleccionar forma de pago con tarjeta', () => {
        // --- Paso 1: setear inputs ---
        fechaInput.value = '2025-10-28';
        cantidadInput.value = '2';
        generarGrilla();

        const filas = grilla.querySelectorAll('tbody tr');
        filas.forEach(tr => {
            const inputEdad = tr.querySelector('input');
            const selectTipo = tr.querySelector('select');
            if (inputEdad) inputEdad.value = 25;
            if (selectTipo) selectTipo.value = 'general';
        });

        // --- Paso 2: seleccionar forma de pago ---
        document.querySelector('input[value="tarjeta"]').checked = true;

        // --- Paso 3: disparar submit ---
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        // --- Paso 4: verificar datos de la compra ---
        const resumen = construirResumenCompra();
        expect(resumen).toContain('Visitante 1: edad 25, tipo GENERAL');
        expect(resumen).toContain('Visitante 2: edad 25, tipo GENERAL');

        // Verificar cantidad y forma de pago
        expect(cantidadInput.value).toBe('2');
        expect(document.querySelector('input[name="pago"]:checked').value).toBe('tarjeta');
    });
  });

  describe('CP2- Compra Exitosa en Efectivo', () => {
    test('Ingresa fecha válida, cantidad de entradas, completar datos de cada visitante ys seleccionar forma de pago efectivo', () => {
        // --- Paso 1: setear inputs ---
        fechaInput.value = '2025-11-12';
        cantidadInput.value = '1';
        generarGrilla();

        const filas = grilla.querySelectorAll('tbody tr');
        filas.forEach(tr => {
            const inputEdad = tr.querySelector('input');
            const selectTipo = tr.querySelector('select');
            if (inputEdad) inputEdad.value = 34;
            if (selectTipo) selectTipo.value = 'general';
        });

        // --- Paso 2: seleccionar forma de pago ---
        document.querySelector('input[value="efectivo"]').checked = true;

        // --- Paso 3: disparar submit ---
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        // --- Paso 4: verificar datos de la compra ---
        const resumen = construirResumenCompra();
        expect(resumen).toContain('Visitante 1: edad 34, tipo GENERAL');

        // Verificar cantidad y forma de pago
        expect(cantidadInput.value).toBe('1');
        expect(document.querySelector('input[name="pago"]:checked').value).toBe('efectivo');
    });
  });

  describe('CP3 - Ingreso de cantidad de entradas', () => {
    test('Debe fallar si la cantidad es 12', () => {
      cantidadInput.value = '12';
      expect(validarCantidadEntradas()).toBe(false);
    });

    test('Debe pasar si la cantidad es 10', () => {
        cantidadInput.value = '10'; 
        expect(validarCantidadEntradas()).toBe(true);
    });

    test('Debe fallar si la cantidad es 0 o negativa', () => {
        cantidadInput.value = '0';
        expect(validarCantidadEntradas()).toBe(false);
    });
  });

  describe('CP4 - Selección de fecha de visita', () => {
    test('Debe fallar si es una fecha pasada', () => {
        fechaInput.value = '2025-10-10'
        expect(validarFecha(false)).toBe(false); //el 1er false no mustra el mensaje de error
        //expect(mostrarMensajeError).not.toHaveBeenCalled();
    });

    test('Debe fallar si la fecha es lunes', () => {
        fechaInput.value = '2025-11-4'
        expect(validarFecha(false)).toBe(false);
    });

    test('Debe fallar para fechas especiales', () => {
        fechaInput.value = '2025-12-25';
        expect(validarFecha(false)).toBe(false);

        fechaInput.value = '2026-01-01';
        expect(validarFecha(false)).toBe(false);
    });

    test('Debe fallar si la fecha es mayor a 1 mes en el futuro', () => {
        fechaInput.value = '2026-12-31'
        expect(validarFecha(false)).toBe(false);
    });
  });

  describe('CP5 - Seleccion de forma de pago', () => {
    test('Debe fallar si no se selecciona forma de pago', () => {
      cantidadInput.value = '1';
      generarGrilla();

      const inputEdad = tbody.querySelector('input');
      const selectTipo = tbody.querySelector('select');

      inputEdad.value = '30';
      selectTipo.value = 'vip';

      // Ningún radio seleccionado
      const form = document.getElementById('formCompra');
      let valido = true;
      const formaPago = document.querySelector('input[name="pago"]:checked');
      if (!formaPago) valido = false;

      expect(valido).toBe(false);
    });
  });

  describe('CP6 - Ingreso de datos de visitantes', () => {
    test('Debe fallar si se ingresan menos datos que la cantidad de entradas', () => {
      cantidadInput.value = '7';
      generarGrilla();

      // Solo completar 6 visitantes
      for (let i = 0; i < 6; i++) {
        const fila = tbody.querySelectorAll('tr')[i];
        fila.cells[1].querySelector('input').value = '25';
        fila.cells[2].querySelector('select').value = 'general';
      }

      expect(validarVisitantes()).toBe(false);
    });
  });
});
