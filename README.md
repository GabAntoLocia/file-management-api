<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.


# 🚀 Proyecto NestJS con MongoDB y Docker

Este proyecto utiliza [NestJS](https://nestjs.com/) con **MongoDB** como base de datos y `docker-compose` para simplificar la ejecución en local.

---

## **📌 Requisitos previos**

Antes de comenzar, asegúrate de tener instalado en tu sistema:

- [Node.js](https://nodejs.org/) (`>=16.x`)
- [npm](https://www.npmjs.com/`)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/install/)

Para verificar que Docker está correctamente instalado, ejecuta:

```bash
docker --version
docker-compose --version
```

Si ves las versiones de Docker y Docker Compose, ya puedes continuar. 

---

## **📂 Instalación y configuración**

### **1️⃣ Clonar el repositorio**

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>
```

### **2️⃣ Crear el archivo `.env`**

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```ini
MONGO_URI=mongodb://admin:adminpassword@mongo:27017/file_management
```

### **3️⃣ Instalar dependencias**

```bash
npm install
```

### **4️⃣ Levantar la aplicación con MongoDB en Docker**

Para iniciar la base de datos, ejecuta:

```bash
docker-compose up -d
```

Para iniciar la app 

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Esto iniciará **MongoDB** y la aplicación en segundo plano.

Si la base de datos no se inicializa o hay problemas con el contendor se puede iniciar una base de datos en memoria para un entorno de pruebas

```ini
USE_IN_MEMORY_DB=true
```

### **5️⃣ Verificar los contenedores en ejecución**

```bash
docker ps
```

Si todo está bien, deberías ver **MongoDB** y la aplicación corriendo.

## **6️⃣ Acceder a la documentación Swagger**

Este proyecto utiliza **Swagger** para documentar y probar las API.

- Una vez que la aplicación está corriendo, puedes acceder a Swagger en la siguiente URL:

  ```
  http://localhost:3000/api
  ```

- Desde esta interfaz podrás explorar los endpoints, probar peticiones y ver la documentación generada automáticamente.


### **6️⃣ Ejecutar pruebas (Opcional)**

Si el proyecto tiene pruebas unitarias o de integración, puedes ejecutarlas con:

```bash
npm run test       # Pruebas unitarias
npm run test:e2e   # Pruebas end-to-end
npm run test:cov   # Cobertura de pruebas
```

### **7️⃣ Apagar los contenedores cuando no los necesites**

```bash
docker-compose down
```

---

## **📦 Configuración de Docker**

El archivo `docker-compose.yml` utilizado en este proyecto:

```yaml
version: "3.8"

services:
  mongo:
    image: mongo:latest
    container_name: mongo_db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: adminpassword
      MONGO_INITDB_DATABASE: file_management
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - mynetwork

volumes:
  mongo_data:

networks:
  mynetwork:
    driver: bridge
```

---

## **🔎 Acceder a la base de datos MongoDB**

Si necesitas acceder a la base de datos dentro del contenedor, puedes ejecutar:

```bash
docker exec -it mongo_db mongosh -u admin -p adminpassword
```

Luego, puedes listar las bases de datos disponibles con:

```bash
show dbs
```

---

## **📌 Notas importantes**

- Asegúrate de que el puerto `27017` no esté en uso antes de levantar el contenedor.
- La base de datos **se creará automáticamente** cuando se ejecute la aplicación.
- Si necesitas eliminar todos los datos almacenados en MongoDB, puedes eliminar el volumen con:

```bash
docker-compose down -v
```

---

### **📢 Soporte y contribuciones**

Si encuentras algún problema o tienes sugerencias, no dudes en abrir un **issue** en el repositorio. 🚀


## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```



## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
