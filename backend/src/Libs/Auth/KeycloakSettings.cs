namespace Libs.Auth
{
    internal class KeycloakSettings
    {
        public required string BaseUrl { get; set; }
        public required string Realm { get; set; }
        public required string ClientId { get; set; }
        public bool RequireHttpsMetadata { get; set; }
    }
}
