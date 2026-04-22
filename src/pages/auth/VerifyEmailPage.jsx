// src/pages/VerifyEmailPage.jsx
import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../lib/axios";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const hasCalled = useRef(false);
  useEffect(() => {
    if (hasCalled.current) return; 
    hasCalled.current = true;
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token không hợp lệ hoặc đã hết hạn.");
        return;
      }
      try {
        const { data } = await api.get(`/auth/verify?token=${token}`);
        if (data.status) {
          setStatus("success");
          setMessage(data.message || "Xác thực thành công!");
        } else {
          setStatus("error");
          setMessage(data.message || "Xác thực thất bại.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Đã có lỗi xảy ra.");
      }
    };

    verify(); // gọi async function bên trong, không dùng .then() trực tiếp
  }, [token]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7">
          <div className="form-box text-center">
            {/* Loading */}
            {status === "loading" && (
              <>
                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                />
                <p>Đang xác thực tài khoản...</p>
              </>
            )}

            {/* Thành công */}
            {status === "success" && (
              <>
                <div style={{ fontSize: 48 }}>✅</div>
                <h4 className="mt-3">Xác thực thành công!</h4>
                <p className="text-muted">{message}</p>
                <Link to="/login" className="btn btn-product mt-2">
                  Đăng nhập ngay
                </Link>
              </>
            )}

            {/* Lỗi */}
            {status === "error" && (
              <>
                <div style={{ fontSize: 48 }}>❌</div>
                <h4 className="mt-3">Xác thực thất bại</h4>
                <p className="text-muted">{message}</p>
                <Link to="/register" className="btn btn-outline-secondary mt-2">
                  Quay lại đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
