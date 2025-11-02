import { getProfile } from "@services/profile.service";

export const useGetProfile = () => {
    const fetchProfile = async () => {
        try {
            const profileData = await getProfile();
            return profileData;
        } catch (error) {
            console.error("Error consiguiendo el perfil:", error);
        }
    }
    return { fetchProfile };
}

export default useGetProfile;