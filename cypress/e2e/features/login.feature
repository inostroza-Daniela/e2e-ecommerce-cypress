# language: es
@login
Característica: Inicio de sesión
  Como cliente registrado
  Quiero iniciar sesión en la tienda
  Para poder ver los productos y hacer pedidos

  @smoke
  Escenario: Cliente inicia sesión con credenciales válidas
    Dado que estoy en la página de inicio de sesión
    Cuando inicio sesión como cliente "estándar"
    Entonces veo el catálogo de productos

  Escenario: Se rechaza el inicio de sesión con credenciales desconocidas
    Dado que estoy en la página de inicio de sesión
    Cuando inicio sesión como cliente "no registrado"
    Entonces veo el error de inicio de sesión "Username and password do not match any user in this service"
    Y sigo en la página de inicio de sesión
    Y el intento fallido se reporta al servicio de monitoreo sin exponer la contraseña

  Escenario: Un cliente bloqueado no puede iniciar sesión
    Dado que estoy en la página de inicio de sesión
    Cuando inicio sesión como cliente "bloqueado"
    Entonces veo el error de inicio de sesión "Sorry, this user has been locked out."
    Y sigo en la página de inicio de sesión
    Y el intento fallido se reporta al servicio de monitoreo sin exponer la contraseña

  Esquema del escenario: El inicio de sesión exige usuario y contraseña
    Dado que estoy en la página de inicio de sesión
    Cuando intento iniciar sesión como cliente "estándar" sin <campo>
    Entonces veo el error de inicio de sesión "<mensaje>"

    Ejemplos:
      | campo      | mensaje              |
      | usuario    | Username is required |
      | contraseña | Password is required |

  Escenario: El inicio de sesión funciona aunque la tienda responda lento
    Dado que estoy en la página de inicio de sesión
    Cuando inicio sesión como cliente "lento"
    Entonces veo el catálogo de productos en menos de 10 segundos

  Escenario: Cerrar sesión termina la sesión
    Dado que inicié sesión como cliente "estándar"
    Cuando cierro sesión
    Entonces estoy en la página de inicio de sesión
    Y no puedo entrar al catálogo sin volver a iniciar sesión

  @visual
  Escenario: La página de inicio de sesión coincide con el diseño aprobado
    Dado que estoy en la página de inicio de sesión
    Entonces la página coincide con el diseño aprobado "login-page"
