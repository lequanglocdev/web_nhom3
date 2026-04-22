import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/authSlice";
import { loginApi } from "../../services/authService";



export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const successMessage = location.state?.message;
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await loginApi(form.email, form.password);

      if (!data.status) {
        setError(data.message || "Đăng nhập thất bại.");
        return;
      }

      // Lưu vào Redux + localStorage
      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.role,
          user: data.user ?? null,
        })
      );

      // Redirect theo role
      navigate(data.role === "ADMIN" ? "/admin/dashboard" : "/");
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7">
          <div className="form-box">
            <h2>Đăng nhập</h2>
            <p className="page-subtitle">
              Đăng nhập để tiếp tục mua sắm và quản lý đơn hàng của bạn.
            </p>

            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success py-2">{successMessage}</div>
            )}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Nhập email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div className="text-end mb-3">
              <Link to="/forgot-password" className="small">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="button"
              className="btn btn-product w-100"
              onClick={handleSubmit}
              disabled={loading}>
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            <p className="mt-3 mb-0 text-center">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
