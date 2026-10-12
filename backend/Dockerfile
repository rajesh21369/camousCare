FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and source directory
COPY pom.xml .
COPY src ./src

# Build the jar skipping tests
RUN mvn clean package -DskipTests

# Runtime container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy packaged jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose server port
EXPOSE 8080

# Run Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
