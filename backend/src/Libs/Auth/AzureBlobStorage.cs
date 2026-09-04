namespace Libs.Auth
{
    public class AzureBlobStorage
    {
        public string StorageAccountName { get; set; }
        public string ConnectionString { get; set; }
        public string StorageAccountKey { get; set; }
        public string ContainerName { get; set; }
        public double UploadDurationInMinutes { get; set; }
        public double DownloadDurationInDays { get; set; }
    }
}
