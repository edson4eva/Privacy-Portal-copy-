#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["backend/src/Services/EServicesData/src/EServicesData.Api/EServicesData.Api.csproj", "backend/src/Services/EServicesData/src/EServicesData.Api/"]
RUN dotnet restore "./backend/src/Services/EServicesData/src/EServicesData.Api/EServicesData.Api.csproj"
COPY . .
WORKDIR "/src/backend/src/Services/EServicesData/src/EServicesData.Api"
RUN dotnet build "./EServicesData.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./EServicesData.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EServicesData.Api.dll"]