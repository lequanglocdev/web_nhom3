import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../../services/authService";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.password) return setError("Vui lòng nhập mật khẩu mới.");
    if (form.password !== form.confirmPassword)
      return setError("Mật khẩu xác nhận không khớp.");
    if (!token) return setError("Token không hợp lệ hoặc đã hết hạn.");

    setLoading(true);
    setError("");

    try {
      const { data } = await resetPasswordApi(token, form.password);
      if (!data.status) {
        setError(data.message || "Đặt lại mật khẩu thất bại.");
        return;
      }
      // Thành công → về login sau 2 giây
      navigate("/login", {
        state: { message: "Đặt lại mật khẩu thành công! Hãy đăng nhập lại." },
      });
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container py-5 text-center">
        <div className="form-box col-lg-5 col-md-7 mx-auto">
          <div style={{ fontSize: 48 }}>❌</div>
          <h4 className="mt-3">Link không hợp lệ</h4>
          <p className="text-muted">
            Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <Link to="/forgot-password" className="btn btn-product mt-2">
            Gửi lại email
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7">
          <div className="form-box">
            <h2>Đặt lại mật khẩu</h2>
            <p className="page-subtitle">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>

            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">
                Mật khẩu mới <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Nhập mật khẩu mới"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">
                Xác nhận mật khẩu <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Nhập lại mật khẩu mới"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <button
              type="button"
              className="btn btn-product w-100"
              onClick={handleSubmit}
              disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Đang xử lý...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
