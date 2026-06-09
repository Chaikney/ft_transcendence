-----------------------------------
Plan del proyecto ft_transcendence
-----------------------------------

Equipo: miembros y funciones
----------------------------

Miembros
........

- Chris Haikney / chaikney
- Nikola / nkrasimi
- Garikoitz / gcassi-d
- Manu / TODO: añadir nombre de usuario aquí
- Borja / bde-mada

Acuerdo
.......

El objetivo es terminarlo «antes del verano».

Funciones
.........

Cada miembro tiene un área general de responsabilidad, acordada en una conversación en mayo de 2026. Esas funciones se describen en documentos que también se incluyen en esta carpeta; consulte dichos documentos para obtener más detalles.

- chaikney -- DevOps
- nkrasimi -- desarrollo backend
- Manu -- desarrollo frontend
- Garikoitz -- motor de ajedrez
- Borja -- compañero de ajedrez con IA

Además de las responsabilidades generales, todos asumirán tareas adicionales según sea necesario y de acuerdo con sus capacidades.

Nivel de actividad esperado
...........................

Cada uno tiene un horario y una disponibilidad diferentes, por lo que superar los retos que se nos plantean requiere una **comunicación regular y clara** con los compañeros. Hay un grupo en Slack (para coordinar el desarrollo) y en WhatsApp (para solicitudes más urgentes).

La evaluación nos obliga a demostrar la contribución de cada miembro del equipo. La forma más sencilla de hacerlo es que *todos*  enviemos código al mismo repositorio.  Esto también muestra a posibles empleadores nuestra capacidad para utilizar git.

El repositorio compartido: https://github.com/Chaikney/ft_transcendence

Se invitará a todos los miembros del equipo a participar, pero para ello deberán crear una cuenta y aceptar la invitación.

Crearemos
---------

Una plataforma que permita jugar a juegos. Los juegos concretos que se tienen en cuenta son el *sudoku* y el *ajedrez*.

Proyecto según los criterios del tema
.....................................

La puntuación y el seguimiento de los puntos necesarios se detallan en una hoja de cálculo (https://my.owndrive.com/s/NHsFqSAC7ZNRG7E), pero incluirán lo siguiente.

Criterios principales (2 puntos)
********************************

* Oponente de IA para los juegos
* Primer juego
  Implementar un juego completo basado en web en el que los usuarios puedan jugar entre sí.
* Segundo juego (sudoku con temporizadores)
  Añadir otro juego con historial de usuario y emparejamiento.
  Realizar un seguimiento del historial y las estadísticas de los usuarios para este juego.
  Implementar un sistema de emparejamiento.
  Mantener el rendimiento y la capacidad de respuesta
  Esto desbloquea el modo multijugador (utilizar temporizadores)
* Jugadores remotos
* Gráficos 3D
  Implementar gráficos 3D avanzados utilizando una biblioteca como Three.js o Babylon.js

Esto implica:

* El uso de un marco de trabajo frontend y backend.

Criterios secundarios (1 punto)
********************************

* Espectador
    Permitir a los usuarios ver las partidas en curso.
    Actualizaciones en tiempo real para los espectadores.
    Opcional: chat para espectadores.
* Gamificación
    Sistema de gamificación para recompensar a los usuarios por sus acciones.
    Implementar al menos 3 de los siguientes elementos: logros, insignias, tablas de clasificación, sistema de XP/niveles, retos diarios, recompensas.
    El sistema debe ser persistente (almacenado en una base de datos)
    Retroalimentación visual para los usuarios (notificaciones, barras de progreso, etc.)
    Reglas claras y mecánica de progresión

Hitos
-----
Es decir, el tiempo que debería llevar cada uno de estos, *con fechas*

Riesgos del proyecto
---------------------

Hay algunos factores que podrían provocar retrasos respecto al tiempo previsto.

- Mezcla de tecnologías
    Los lenguajes utilizados para las diferentes partes del proyecto no son homogéneos ni necesariamente los más fáciles de combinar. Entre ellos se incluyen C++, TypeScript (JavaScript) y Ruby. Se prevé que el uso de contenedores y la orquestación permitan que funcionen bien juntos; sin embargo, el hecho es que sus sistemas de compilación y enfoques generales pueden presentar incompatibilidades que provoquen retrasos.
- Pérdida de un miembro del equipo
    Cada miembro del equipo tiene una disponibilidad, un horario y unos compromisos diferentes. Esto supone un reto que esperamos mitigar mediante la comunicación, tanto verbal como escrita. Puede que resulte imposible que el equipo actual de 5 personas complete el proyecto en conjunto, pero la pérdida de un solo miembro no invalidaría el proyecto.
- Falta de funcionalidades
    En relación con lo anterior, la pérdida de un miembro del equipo obligaría a sustituir las tareas de las que era responsable, ya sea optando por un enfoque diferente o recurriendo a otro miembro para que se encargara de cumplir con los requisitos.
- Pruebas inadecuadas
    El entorno mixto y el ajustado calendario hacen que sea importante contar con un plan de pruebas claramente definido que cualquier miembro pueda consultar y examinar. Esto podría funcionar bien si se gestiona correctamente.
- Entorno de evaluación
    La evaluación comenzará con mal pie si el evaluador tiene que empezar con complicadas soluciones provisionales para poner en marcha el sistema en los ordenadores del clúster. Para mitigar esto, debería haber una máquina virtual disponible con el software y la configuración necesarios para actuar como un host adecuado (p. ej., Podman). Esto debería ir acompañado de instrucciones claras de uso y una demostración de que no hay trucos ocultos (p. ej., que la caché está vacía).
- Falta de comprensión entre equipos
    Todos los miembros del equipo deben ser capaces de explicar y mostrar su parte en el proyecto. No es necesario que expliquen los detalles de las funciones de los demás, pero *deben* saber cuáles son esas funciones y cómo interactúan con las demás partes del proyecto. También deben ser capaces de explicar su función en profundidad y responder a preguntas al respecto. Si el evaluador requiere cambios, deben ser capaces de demostrar cómo se llevarían a cabo. Las compensaciones de diseño deben ser conocidas y explicables.

Retos actuales que requieren más tiempo
---------------------------------------

- Borja ha estado fuera por motivos de trabajo hasta la fecha (08/06/2026) y aún no se ha podido iniciar el trabajo de integración.
- chaikney es un despistado que reservó un número incorrecto de días en su periodo de congelación (final). Tiene una fecha de agujero negro el 15 de junio de 2026 a pesar de haber utilizado solo 73 días de congelación.
- Manu trabaja en Navarra durante la primera parte de la semana y puede estar presente en la torre de jueves a sábado.
- garikoitz tuvo exámenes hasta el jueves pasado (04-06-2026), pero ahora está totalmente disponible.
- nkrasimi tiene disponibilidad general desde los miércoles hasta el fin de semana.

La intención de todo el equipo es completar el proyecto antes del comienzo del verano. Las fechas objetivo más probables son la finalización del proyecto para el 23 de junio, dejando la semana siguiente para las evaluaciones.

Sobre IA
--------

Documento escrito de mano por chaikney en inglés, que es el versión definitivo, y antes: "Traducción realizada con la versión gratuita del traductor DeepL.com".
