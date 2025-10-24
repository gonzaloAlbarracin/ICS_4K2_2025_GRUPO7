/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';


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
  mostrarMensajeError,
  obtenerCantidad,
  calcularTotal,
  actualizarTotal,
} from '../scripts.js';
global.fetch = jest.fn().mockResolvedValue({ ok: true });

global.Toastify = jest.fn().mockReturnValue({ showToast: jest.fn() });
global.obtenerGrilla = jest.fn(() => document.getElementById('grillaVisitantes'));
global.obtenerGrillaActualizada = jest.fn();
//global.obtenerGrilla = jest.fn(() => tabla);

describe('Compra de entradas', () => {
  let fechaInput, cantidadInput, grilla, tbody, form, formaPago, edadInput1, edadInput2, entradaSelect1, entradaSelect2;

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
        <tbody>
          <tr>
            <td>1</td>
            <td><input id="edad1" type="number"></td>
            <td>
              <select id="tipo1">
                <option value=""></option>
                <option value="general">General</option>
                <option value="vip">VIP</option>
              </select></td>
          </tr>
          <tr>
            <td>2</td>
            <td><input id="edad2" type="number"></td>
            <td>
              <select id="tipo2">
                <option value=""></option>
                <option value="general">General</option>
                <option value="vip">VIP</option>
              </select></td>
          </tr>
        </tbody>
        <thead><tr><th>Visitante</th><th>Edad</th><th>Tipo</th></tr></thead>
        <tbody></tbody>
      </table>
      <div id="total"></div>
    `;

    // --- MOCK de mostrar mensajes --- // Eliminar pq no validamos mostrar mensajes                   
    //mostrarMock = jest.spyOn({mostrarMensajeError}, 'mostrarMensajeError').mockImplementation(() => {});

    form = document.getElementById('formCompra'); 
    fechaInput = document.getElementById('fechaVisita');
    cantidadInput = document.getElementById('cantidadEntradas');
    grilla = document.getElementById('grillaVisitantes');
    tbody = grilla.querySelector('tbody');
    formaPago = document.querySelector('input[name="pago"]:checked') //null pq no hay selección
    edadInput1 = document.getElementById('edad1');
    edadInput2 = document.getElementById('edad2');
    entradaSelect1 = document.getElementById('tipo1');
    entradaSelect2 = document.getElementById('tipo2');
    
    configurarInputFecha();

    // Mock de funciones de éxito/error. // Espiamos las funciones críticas y las convertimos en mocks
    //jest.spyOn(Scripts, 'mostrarMensajeExito').mockImplementation(jest.fn());
    //jest.spyOn(Scripts, 'mostrarMensajeError').mockImplementation(jest.fn());
    //jest.spyOn(Scripts, 'enviarEmailResumenHardcodeado').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  

  describe('CP1 - Ingreso de cantidad de entradas', () => {
    test('Debe FALLAR si la cantidad es 12', () => {
      cantidadInput.value = '12';
      expect(validarCantidadEntradas()).toBe(false);
    });

    test('Debe PASAR si la cantidad es 10', () => {
        cantidadInput.value = '10'; 
        expect(validarCantidadEntradas()).toBe(true);
    });

    test('Debe FALLAR si la cantidad es 0 o negativa', () => {
        cantidadInput.value = '0';
        expect(validarCantidadEntradas()).toBe(false);

        cantidadInput.value = '-7';
        expect(validarCantidadEntradas()).toBe(false);
    });
  });

  describe('CP2 - Selección de fecha de visita', () => {
    test('Debe FALLAR si es una fecha pasada', () => {
      fechaInput.value = '2025-10-10';
      expect(validarFecha(false)).toBe(false); 
    });

    test('Debe FALLAR si la fecha es lunes', () => {
      fechaInput.value = '2025-11-03'; // Este sí es lunes
      expect(validarFecha(false)).toBe(false);
    });

    test('Debe FALLAR para fechas especiales', () => {
      fechaInput.value = '2025-12-25'; //ver, pq da error pero pq es una fecha mayor a 1 mes
      expect(validarFecha(false)).toBe(false);

      fechaInput.value = '2026-01-01';
      expect(validarFecha(false)).toBe(false);
    });

    test('Debe FALLAR si la fecha es mayor a 1 mes en el futuro', () => {
      fechaInput.value = '2026-11-29'; 
      expect(validarFecha(false)).toBe(false);
    });

    test('Debe FALLAR si no se selecciona fecha de visita',() => {
      fechaInput.value = '';
      expect(validarFecha()).toBe(false);
    });
  });

  describe('CP3 - Seleccion de forma de pago', () => { //no se si esta bien hecha la validacion 
    test('Debe FALLAR si no se selecciona forma de pago', () => {
      const valido = !!formaPago; // convierte null → false
      expect(valido).toBe(false);
    });
  });

  describe('CP4 - Validaciones de la grilla de visitantes', () => { 
    test('Debe FALLAR si no se completan los datos de todos los visitantes', () => {
      // Se simula que la grilla genera 2 visitantes (falta edad del visitante 2)
      cantidadInput.value = '2';
      edadInput1.value = '34';
      edadInput2.value = '';
      entradaSelect1.value = 'general';
      entradaSelect2.value = 'general';
  
      expect(validarVisitantes()).toBe(false);
    });

    test('Debe PASAR si todos los visitantes están completos', () => {
      // Simulamos que todos los datos están completos
      cantidadInput.value = '2';
      edadInput1.value = '23';
      edadInput2.value = '30';
      entradaSelect1.value = 'general';
      entradaSelect2.value = 'vip';

      expect(validarVisitantes()).toBe(true);
    });

    test('Debe PASAR si aplica el descuento 50% para menores de 15 o mayores de 60', () => {
      edadInput1.value = '10';
      edadInput2.value = '65';
      entradaSelect1.value = 'general';
      entradaSelect2.value = 'vip';

      expect(calcularTotal()).toBe(7500);
    });
  });

  /*describe('CP5 - Simula compra completa con Tarjeta', () => {
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

  describe('CP6 - Simula compra completa en Efectivo', () => {
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
  });*/

});
