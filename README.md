# Suite E2E de E-commerce · Cypress + Cucumber

[![E2E Tests](https://github.com/inostroza-Daniela/e2e-ecommerce-cypress/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/inostroza-Daniela/e2e-ecommerce-cypress/actions/workflows/e2e-tests.yml)
![Cypress](https://img.shields.io/badge/Cypress-16-17202C?logo=cypress&logoColor=white)
![Cucumber](https://img.shields.io/badge/BDD-Cucumber-23D96C?logo=cucumber&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

**Español** · [English](README.en.md)

Pruebas end-to-end de interfaz para **[Swag Labs](https://www.saucedemo.com)**, la tienda demo pública de Sauce Labs. La suite cubre el recorrido de compra completo (inicio de sesión, catálogo, carro y checkout), casos negativos, diseño responsive y regresión visual. Los escenarios están escritos en Gherkin en español, legibles para producto y QA manual, sobre un Page Object Model.

## Por qué Swag Labs

- Su HTML expone atributos `data-test` estables, así que los selectores no dependen de clases CSS ni de la posición en el DOM.
- Trae usuarios diseñados para pruebas (bloqueado, lento, etc.) que hacen deterministas los casos negativos y de resiliencia.
- Tiene un checkout completo con validaciones y cálculo de impuesto, lo que permite verificar reglas de negocio reales y no solo que "la página cargó".
- Su código es público ([saucelabs/sample-app-web](https://github.com/saucelabs/sample-app-web)), así que el comportamiento esperado se puede contrastar con la implementación.

## Stack

| Ámbito | Herramienta |
| --- | --- |
| Test runner | [Cypress](https://www.cypress.io) 16 (JavaScript) |
| BDD | [@badeball/cypress-cucumber-preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor) + esbuild |
| Patrón de diseño | Page Object Model + custom commands |
| Reportes | [cypress-mochawesome-reporter](https://github.com/LironEr/cypress-mochawesome-reporter) con screenshots de fallos |
| Regresión visual | [@simonsmith/cypress-image-snapshot](https://github.com/simonsmith/cypress-image-snapshot) |
| Análisis estático | ESLint + eslint-plugin-cypress |
| Contenedores | Docker (`cypress/included`) |
| CI/CD | GitHub Actions |

## Cobertura

| Feature | Escenarios |
| --- | --- |
| `login.feature` | Login válido · credenciales desconocidas · usuario bloqueado · campos obligatorios · respuestas lentas · el logout cierra la sesión · regresión visual |
| `catalog.feature` | Listado completo de productos · ordenamiento por nombre y precio (ambos sentidos) · detalle de producto · diseño en móvil, tablet y escritorio · regresión visual |
| `cart.feature` | Carro vacío · contador del carro · cantidades y precios · quitar productos · el carro se conserva al seguir comprando |
| `checkout.feature` | Compra completa con totales e impuesto de 8% · datos de despacho obligatorios · cancelar el checkout |

28 escenarios en total. Los tags permiten ejecutar partes de la suite: `@smoke`, `@e2e`, `@visual`, `@responsive` y uno por feature.

## Estructura del proyecto

```
cypress/
├── e2e/
│   ├── features/            Especificaciones Gherkin
│   └── step_definitions/    Implementación de los pasos (un archivo por feature + pasos comunes)
├── pages/                   Page Objects
│   └── components/          Fragmentos de UI reutilizables (header, menú, contador del carro)
├── fixtures/                Datos de prueba: usuarios, productos, cliente, dispositivos
├── snapshots/               Imágenes base aprobadas para la regresión visual
└── support/                 Custom commands, hooks globales y utilidades
```

## Decisiones de diseño

- **Gherkin en español, código en inglés.** Los `.feature` usan `# language: es` (`Característica`, `Escenario`, `Dado`, `Cuando`, `Entonces`) para que cualquier persona del equipo los lea. El código sigue la convención de la industria y está en inglés. Términos como la posición de una imagen se traducen con un parameter type propio de Cucumber.
- **Login una vez, reutilizado en todas partes.** `cy.login(username, password)` hace un login real por UI dentro de `cy.session()`, cacheado entre specs y validado contra la cookie de sesión. El login en sí se prueba por UI en `login.feature`; el resto de las features parte ya autenticado, lo que mantiene los escenarios rápidos e independientes.
- **Deep links sin redirecciones.** La demo es una single-page app publicada en GitHub Pages: pedir `/inventory.html` directamente devuelve HTTP 404 y un script redirige a `/?/inventory.html`. `cy.visitRoute()` va directo a la URL canónica, así los tests mantienen la validación estricta de status HTTP en vez de desactivarla.
- **El estado se precarga, no se construye a clicks.** Los escenarios que necesitan un carro con productos lo escriben directamente en el storage de la aplicación antes de cargar la página (`cy.visitWithCart`). Solo los escenarios que prueban agregar productos lo hacen por UI.
- **Sin esperas fijas.** Toda espera es una aserción que Cypress reintenta (`should`), un timeout explícito o un alias de red creado con `cy.intercept()`. La regla de lint `cypress/no-unnecessary-waiting` convierte cualquier `cy.wait(ms)` en un error de build.
- **Control de red.** La telemetría de terceros se intercepta en cada test para que los resultados no dependan de un servicio externo. Los logins fallidos se capturan con un intercept para verificar que se reportan al servicio de monitoreo **sin filtrar la contraseña**.
- **Los datos viven en fixtures.** Usuarios, precios, datos de despacho y tamaños de pantalla vienen de `cypress/fixtures`; los totales esperados se calculan a partir de ellos, no se escriben a mano.
- **Escenarios independientes.** Cada escenario crea su propio estado, usa aliases de Cypress para los datos del escenario y puede ejecutarse solo.

## Instalación

Requisitos: Node.js 22+ y npm. Docker es opcional.

```bash
git clone https://github.com/inostroza-Daniela/e2e-ecommerce-cypress.git
cd e2e-ecommerce-cypress
npm ci
```

## Ejecutar los tests

| Comando | Qué hace |
| --- | --- |
| `npm run cy:open` | Abre la interfaz de Cypress para ejecutar escenarios en modo interactivo |
| `npm test` | Ejecuta la suite completa en modo headless |
| `npm run test:local` | Ejecuta en headless sin los escenarios `@visual` |
| `npm run test:smoke` | Ejecuta solo los escenarios `@smoke` |
| `npm run lint` | Análisis estático |

Se puede pasar cualquier expresión de tags de Cucumber:

```bash
npx cypress run --expose "tags=@checkout and not @visual"
```

## Ejecutar con Docker

La imagen se basa en `cypress/included` y está fijada a la misma versión de Cypress que `package.json`, así que las ejecuciones locales y el CI corren en un entorno idéntico.

```bash
npm run docker:build
npm run docker:test
```

El contenedor usa Chrome. Los reportes, screenshots de fallos y diferencias visuales quedan en el equipo local, en `cypress/results/` y `cypress/snapshots/`.

## Regresión visual

Los screenshots se renderizan distinto según el sistema operativo (fuentes, antialiasing, pantallas Retina), así que las imágenes base se generan y comparan **solo en Linux**, dentro de la imagen Docker que también usa el CI. En macOS y Windows los escenarios `@visual` se marcan como omitidos en vez de fallar. La imagen se construye para `linux/amd64` para calzar con los runners de GitHub, también en Apple Silicon.

La forma más simple de regenerar las imágenes base es desde GitHub: **Actions → E2E Tests → Run workflow** con **update_snapshots** activado. El job commitea las imágenes nuevas en `cypress/snapshots/`.

También se puede hacer localmente:

```bash
npm run docker:build
npm run docker:snapshots
git add cypress/snapshots
```

El CI corre con `requireSnapshots=true`, así que si falta una imagen base el build falla en vez de crearla en silencio. Cuando una comparación falla, la imagen con las diferencias se sube como artifact del build.

## Reportes

Cada ejecución genera un reporte HTML con gráficos, los pasos Gherkin de cada escenario y screenshots de los fallos:

```
cypress/results/report/index.html
```

En el CI, el reporte se publica como el artifact `mochawesome-report` de cada ejecución.

## Ejemplo BDD

Los escenarios describen el comportamiento en lenguaje de negocio; los detalles de implementación viven en los step definitions y los Page Objects.

```gherkin
# language: es
@checkout
Característica: Proceso de compra
  Como cliente con productos en el carro
  Quiero completar mi compra
  Para que mi pedido quede registrado

  Antecedentes:
    Dado que inicié sesión como cliente "estándar"

  @smoke @e2e
  Escenario: Cliente compra productos del catálogo
    Cuando agrego los siguientes productos al carro:
      | producto                |
      | Sauce Labs Backpack     |
      | Sauce Labs Bolt T-Shirt |
    Y abro el carro
    Entonces el carro muestra cada producto elegido con cantidad 1 y su precio de catálogo
    Cuando paso al checkout
    Y envío mis datos de despacho
    Entonces el resumen del pedido muestra los productos elegidos
    Y el total del pedido es el subtotal más 8% de impuesto
    Cuando confirmo el pedido
    Entonces veo la confirmación del pedido
    Y no se muestra el contador del carro
```

## Integración continua

El workflow `.github/workflows/e2e-tests.yml` corre en cada push a `main`, en cada pull request y a pedido:

1. **lint**: instala las dependencias sin el binario de Cypress y ejecuta ESLint.
2. **e2e**: construye la imagen Docker y ejecuta la suite completa. Sube el reporte Mochawesome y, si algo falla, los screenshots y las diferencias visuales.

La ejecución manual (`workflow_dispatch`) acepta una expresión de tags para correr una parte de los escenarios, o la opción de regenerar las imágenes base.

## Alcance

- La demo no maneja inventario ni stock, así que los escenarios de "producto sin stock" no aplican.
- El catálogo ofrece ordenamiento pero no filtros; el ordenamiento está cubierto en todas sus opciones.
- Los textos de la interfaz (mensajes de error, opciones de ordenamiento, nombres de productos) están en inglés porque así los muestra el sitio.
- Los tests corren contra un sitio público; en modo run se permite un reintento para absorber fallas de red puntuales sin ocultar fallas consistentes.

## Autora

**Daniela Inostroza Mancilla** · QA Automation Engineer
[GitHub](https://github.com/inostroza-Daniela) · [LinkedIn](https://www.linkedin.com/in/daniela-inostrozam/)

Distribuido bajo la [licencia MIT](LICENSE).
