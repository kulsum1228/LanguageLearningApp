import { useRouter } from "expo-router";
import { useEffect } from "react";
import { getToken } from "./utils/storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      if (token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    };
    checkToken();
  }, []);

  return null;
}
