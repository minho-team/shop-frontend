import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_SERVER_HOST,
  withCredentials: true,
});

// 401 발생 시 refresh 후 원래 요청 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 서버 응답 자체가 없는 경우
    if (!error.response) {
      return Promise.reject(error);
    }

    // refresh 요청 자체가 실패한 경우 무한루프 방지
    if (
      originalRequest.url === "/api/auth/refresh" ||
      originalRequest.url === "/api/auth/kakao"
    ) {
      return Promise.reject(error);
    }

    // 401이고 아직 재시도 안 했으면
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // refresh token으로 access token 재발급
        await apiClient.post("/api/auth/refresh");

        // 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;