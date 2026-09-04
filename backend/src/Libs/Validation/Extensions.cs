using FluentValidation;

namespace Libs.Validation
{
    public static class Extensions
    {
        public static async Task HandleValidationAsync<TRequest>(this IValidator<TRequest> validator, TRequest request)
        {
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                throw new System.ComponentModel.DataAnnotations.ValidationException(validationResult.Errors?.First()?.ErrorMessage);
            }
        }
    }
}
