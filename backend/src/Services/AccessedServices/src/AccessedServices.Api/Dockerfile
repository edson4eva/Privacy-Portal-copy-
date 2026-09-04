#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER root
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Add multiple Sectigo-related CA certificates
COPY certs/ /usr/local/share/ca-certificates/
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    update-ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


# Drop back to non-root user after setup
USER app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG build_configuration
ARG username
ARG secret
WORKDIR /src
COPY ["backend/src/Services/AccessedServices/src/AccessedServices.Api/AccessedServices.Api.csproj", "backend/src/Services/AccessedServices/src/AccessedServices.Api/"]
COPY ["nuget.config", "."]
RUN dotnet nuget update source github --username ${username} --password ${secret} --store-password-in-clear-text --configfile nuget.config
RUN dotnet restore "./backend/src/Services/AccessedServices/src/AccessedServices.Api/AccessedServices.Api.csproj"
COPY . .
RUN dotnet nuget update source github --username ${username} --password ${secret} --store-password-in-clear-text --configfile nuget.config
WORKDIR "/src/backend/src/Services/AccessedServices/src/AccessedServices.Api"
RUN dotnet build "./AccessedServices.Api.csproj" -c $build_configuration -o /app/build

FROM build AS publish
RUN dotnet publish "./AccessedServices.Api.csproj" -c $build_configuration -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ARG build_configuration
ENV ASPNETCORE_ENVIRONMENT=$build_configuration
ENTRYPOINT ["dotnet", "AccessedServices.Api.dll"]
