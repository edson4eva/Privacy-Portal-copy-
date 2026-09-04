using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Net;
using System.Text;
using Microsoft.Extensions.Logging;

namespace Libs.Notification
{
    public class NotificationService : INotificationService
    {
        private readonly bool _isEnabled = false;
        private readonly string? _apiKey;
        private readonly string? _apiUrl;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(IConfiguration configuration, ILogger<NotificationService> logger)
        {
            _apiUrl = configuration["AbNotify:ALBERTA_NOTIFY_API_URL"];
            _apiKey = configuration["AbNotify:ALBERTA_NOTIFY_API_KEY"];
            bool.TryParse(configuration["AbNotify:IsEnabled"], out _isEnabled);
            _logger = logger;
        }

        public async Task<bool> Send<T>(string? templateId, string? emailAddress, T personalisation) where T : class, IPersonalisation
        {
            if (!_isEnabled)
            {
                return false;
            }

            try
            {
                if (personalisation == null)
                {
                    throw new ArgumentNullException(nameof(personalisation), "Personalisation object cannot be null");
                }

                var personalisationDict = personalisation.GetDictionary(); 
                if (personalisationDict == null)
                {
                    throw new InvalidOperationException("GetDictionary returned null");
                }
                
                AlbertaNotifyPayload payload = new AlbertaNotifyPayload()
                {
                    template_id = templateId,
                    email_address = emailAddress,
                    personalisation = personalisationDict
                };

                var json = JsonConvert.SerializeObject(payload);
                HttpContent data = new StringContent(json, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await this.SendEmail(data);

                var body = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to send email. {Response}", body);
                    throw new System.Exception(body);
                }

                return true;
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "An error occurred while sending email.");
                throw;
            }
        }

        private async Task<string?> GetBearerToken()
        {
            try
            {
                AlbertaNotifyApiKey key = new AlbertaNotifyApiKey() { api_key = _apiKey };
                var data = new StringContent(JsonConvert.SerializeObject(key), Encoding.UTF8, "application/json");

                HttpClient client = new HttpClient();
                string url = _apiUrl + "/token";

                HttpResponseMessage response = await client.PostAsync(url, data);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    return await response.Content.ReadAsStringAsync();
                }
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting bearer token.");
            }

            return null;
        }

        private async Task<HttpResponseMessage> SendEmail(HttpContent payload)
        {
            try
            {
                string? token = await GetBearerToken();

                HttpClient client = new HttpClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                return await client.PostAsync(_apiUrl + "/v2/notifications/email", payload);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "An error occurred while sending email."); 
                return new HttpResponseMessage(HttpStatusCode.InternalServerError);
            }
        }
    }

    public class AlbertaNotifyApiKey
    {
        public string? api_key { get; set; }
    }

    public class AlbertaNotifyPayload
    {
        public string? template_id { get; set; }
        public string? email_address { get; set; }
        public Dictionary<string, dynamic> personalisation { get; set; }

        public AlbertaNotifyPayload()
        {

        }

        public AlbertaNotifyPayload(Dictionary<string, dynamic> personalisation)
        {
            this.personalisation = personalisation;
        }
    }
}
