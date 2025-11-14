FROM eclipse-temurin:17-jre
RUN useradd -m app
WORKDIR /app

COPY target/users-service-0.0.1-SNAPSHOT.jar app.jar

USER app
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]