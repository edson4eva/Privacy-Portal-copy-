# =====================
# Base Runtime Image
# =====================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER root
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Install CA certs (Sectigo, USERTrust, etc.)
COPY certs/ /usr/local/share/ca-certificates/
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    update-ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*



# Drop to non-root after cert setup
USER app

# =====================
# Build Stage
# =====================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG build_configuration
ARG username
ARG secret

WORKDIR /src

COPY ["backend/src/Services/Complaints/src/Complaints.API/Complaints.Api.csproj", "backend/src/Services/Complaints/src/Complaints.API/"]
COPY ["backend/src/Services/Complaints/src/Complaints/Complaints.csproj", "backend/src/Services/Complaints/src/Complaints/"]
COPY ["backend/src/Libs/Libs.csproj", "backend/src/Libs/"]
COPY ["nuget.config", "."]
RUN dotnet nuget update source github --username ${username} --password ${secret} --store-password-in-clear-text --configfile nuget.config
RUN dotnet restore "backend/src/Services/Complaints/src/Complaints.API/Complaints.Api.csproj"

COPY . .

WORKDIR "/src/backend/src/Services/Complaints/src/Complaints.API"
RUN dotnet build "Complaints.Api.csproj" -c $build_configuration -o /app/build

# =====================
# Publish Stage
# =====================
FROM build AS publish
RUN dotnet publish "Complaints.Api.csproj" -c $build_configuration -o /app/publish /p:UseAppHost=false

# =====================
# Final Runtime Stage
# =====================
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ARG build_configuration
ENV ASPNETCORE_ENVIRONMENT=$build_configuration
ENTRYPOINT ["dotnet", "Complaints.Api.dll"]
