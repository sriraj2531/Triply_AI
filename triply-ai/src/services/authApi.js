import { useGoogleLogin } from "@react-oauth/google";
import axios from 'axios';

export const fetchUserProfile = (accessToken) => {
    return axios.get("https://openidconnect.googleapis.com/v1/userinfo",{
        headers:{
            Authorization:`Bearer ${accessToken}`,
            Accept: "application/json"
        }
    })
}


// useGoogleAuth hook
export const useGoogleAuth = ({onSuccess}) => {
    return useGoogleLogin({
        onSuccess: async (codeResponse) => {
            const res = await fetchUserProfile(codeResponse.access_token)
            localStorage.setItem("user", JSON.stringify(res.data))
            onSuccess?.(res.data)
        },
        onError:console.log()
      }); 
};