using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Utils
{
    public static class StringUtils
    {
        public static string MaskStringEnding(this string value, int digitsToKeep)
        {
            if (string.IsNullOrEmpty(value))
            {
                return value;
            }
            if (digitsToKeep >= value.Length)
            {
                return value;
            }
            else
            {
                var builder = new StringBuilder();
                var chars = value.ToCharArray();
                for (var i = 0; i<chars.Length; i++)
                {
                    if(i<digitsToKeep)
                    {
                        builder.Append(chars[i]);
                    }
                    else
                    {
                        builder.Append('*');
                    }
                    
                }
                return builder.ToString();
            }
        }
    }
}
