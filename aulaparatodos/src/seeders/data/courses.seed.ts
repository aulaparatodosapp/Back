import { CourseModality } from '../../common/course-modality.enum';

interface CourseSeed {
  titulo: string;
  descripcion: string;
  descripcionDetallada: string;
  imagenUrl: string | null;
  objetivos: string[];
  requisitos: string[];
  duracionHoras: number;
  modalidad: CourseModality;
  cuposDisponibles: number;
  categoriaNombre: string;
}

export const coursesSeed: CourseSeed[] = [
  {
    titulo: 'Introducción a la informática',
    descripcion:
      'Aprende los fundamentos de la informática y el uso básico de una computadora.',
    descripcionDetallada:
      'Este curso está diseñado para ayudarte a desarrollar nuevas habilidades mediante contenidos organizados por módulos.',
    imagenUrl: null,
    objetivos: [
      'Comprender el funcionamiento básico de una computadora.',
      'Identificar los principales componentes informáticos.',
      'Utilizar herramientas digitales básicas.',
    ],
    requisitos: [
      'No necesitas conocimientos previos.',
      'Tener interés en aprender informática.',
    ],
    duracionHoras: 20,
    modalidad: CourseModality.VIRTUAL,
    cuposDisponibles: 5,
    categoriaNombre: 'Informática',
  },
  {
    titulo: 'Herramientas de oficina',
    descripcion:
      'Aprende a utilizar las principales herramientas de oficina y productividad.',
    descripcionDetallada:
      'Desarrolla habilidades para crear documentos, hojas de cálculo y presentaciones digitales.',
    imagenUrl: null,
    objetivos: [
      'Crear y editar documentos de texto.',
      'Utilizar hojas de cálculo.',
      'Diseñar presentaciones digitales.',
    ],
    requisitos: [
      'Conocimientos básicos de informática.',
    ],
    duracionHoras: 25,
    modalidad: CourseModality.VIRTUAL,
    cuposDisponibles: 5,
    categoriaNombre: 'Ofimática y productividad digital',
  },
  {
    titulo: 'Internet y seguridad digital',
    descripcion:
      'Aprende a navegar por internet de manera segura y responsable.',
    descripcionDetallada:
      'Conoce las principales herramientas de navegación y las buenas prácticas para proteger tu información personal.',
    imagenUrl: null,
    objetivos: [
      'Utilizar navegadores web.',
      'Identificar amenazas digitales.',
      'Proteger la información personal.',
      'Crear contraseñas seguras.',
    ],
    requisitos: [
      'Conocimientos básicos de informática.',
    ],
    duracionHoras: 20,
    modalidad: CourseModality.VIRTUAL,
    cuposDisponibles: 5,
    categoriaNombre: 'Informática',
  },
  {
    titulo: 'Herramientas digitales',
    descripcion:
      'Desarrolla habilidades para utilizar herramientas digitales en diferentes ámbitos.',
    descripcionDetallada:
      'Aprende a utilizar plataformas digitales para mejorar la productividad, la comunicación y el trabajo colaborativo.',
    imagenUrl: null,
    objetivos: [
      'Utilizar herramientas de trabajo colaborativo.',
      'Gestionar archivos en la nube.',
      'Mejorar la productividad digital.',
    ],
    requisitos: [
      'Conocimientos básicos de informática.',
      'Manejo básico de internet.',
    ],
    duracionHoras: 30,
    modalidad: CourseModality.VIRTUAL,
    cuposDisponibles: 5,
    categoriaNombre: 'Informática',
  },
  {
    titulo: 'Diseño digital',
    descripcion:
      'Aprende los fundamentos del diseño y la creación de contenidos digitales.',
    descripcionDetallada:
      'Explora herramientas de diseño gráfico y desarrolla habilidades creativas para comunicar ideas visualmente.',
    imagenUrl: null,
    objetivos: [
      'Comprender los principios del diseño.',
      'Utilizar herramientas de diseño digital.',
      'Crear contenidos visuales.',
    ],
    requisitos: [
      'Manejo básico de una computadora.',
      'Interés en el diseño y la creatividad.',
    ],
    duracionHoras: 35,
    modalidad: CourseModality.VIRTUAL,
    cuposDisponibles: 5,
    categoriaNombre: 'Diseño',
  },
  {
    titulo: 'Introducción a la programación',
    descripcion:
      'Aprende los conceptos fundamentales de la programación.',
    descripcionDetallada:
      'Desarrolla el pensamiento lógico y aprende a resolver problemas mediante algoritmos y código.',
    imagenUrl: null,
    objetivos: [
      'Comprender la lógica de programación.',
      'Utilizar variables y tipos de datos.',
      'Implementar estructuras de control.',
      'Desarrollar programas sencillos.',
    ],
    requisitos: [
      'Conocimientos básicos de informática.',
      'No se requiere experiencia previa en programación.',
    ],
    duracionHoras: 40,
    modalidad: CourseModality.VIRTUAL,
    cuposDisponibles: 5,
    categoriaNombre: 'Programación y desarrollo web',
  },
  {
    titulo: 'Desarrollo web',
    descripcion:
      'Aprende a crear sitios y aplicaciones web.',
    descripcionDetallada:
      'Desarrolla proyectos web utilizando tecnologías modernas y aplica buenas prácticas de programación.',
    imagenUrl: null,
    objetivos: [
      'Crear sitios web con HTML y CSS.',
      'Implementar funcionalidades con JavaScript.',
      'Comprender el funcionamiento de las APIs.',
      'Desarrollar aplicaciones web.',
    ],
    requisitos: [
      'Conocimientos básicos de programación.',
      'Manejo de herramientas digitales.',
    ],
    duracionHoras: 60,
    modalidad: CourseModality.VIRTUAL,
    cuposDisponibles: 5,
    categoriaNombre: 'Programación y desarrollo web',
  },
  {
    titulo: 'Análisis de datos',
    descripcion:
      'Aprende a procesar, interpretar y visualizar datos.',
    descripcionDetallada:
      'Utiliza herramientas de análisis para transformar datos en información útil para la toma de decisiones.',
    imagenUrl: null,
    objetivos: [
      'Organizar y limpiar conjuntos de datos.',
      'Interpretar información estadística.',
      'Crear visualizaciones de datos.',
      'Elaborar informes de análisis.',
    ],
    requisitos: [
      'Conocimientos de hojas de cálculo.',
      'Conocimientos básicos de matemática.',
    ],
    duracionHoras: 50,
    modalidad: CourseModality.VIRTUAL,
    cuposDisponibles: 5,
    categoriaNombre: 'Análisis de datos',
  },
  {
    titulo: 'Desarrollo de proyectos digitales',
    descripcion:
      'Aprende a planificar y desarrollar proyectos tecnológicos.',
    descripcionDetallada:
      'Integra los conocimientos adquiridos para diseñar, gestionar y desarrollar soluciones digitales.',
    imagenUrl: null,
    objetivos: [
      'Planificar proyectos digitales.',
      'Definir objetivos y requerimientos.',
      'Aplicar metodologías de trabajo colaborativo.',
      'Desarrollar y presentar un proyecto final.',
    ],
    requisitos: [
      'Conocimientos intermedios de herramientas digitales.',
      'Experiencia básica en proyectos tecnológicos.',
    ],
    duracionHoras: 60,
    modalidad: CourseModality.VIRTUAL,
    cuposDisponibles: 5,
    categoriaNombre: 'Tecnología y proyectos digitales',
  },
];
