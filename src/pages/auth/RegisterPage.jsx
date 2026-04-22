import { Link} from "react-router-dom";
import { registerApi } from "../../services/authService";
import { useState } from "react";

export default function RegisterPage() {
  
    const [form, setForm] = useState({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
  
    const handleChange = (e) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      setError("");
      setSuccess("");
    };
  
    const validate = () => {
      if (!form.fullName.trim()) return "Vui lòng nhập họ và tên.";
      if (!form.email.trim()) return "Vui lòng nhập email.";
      if (!form.password) return "Vui lòng nhập mật khẩu.";
      if (form.password !== form.confirmPassword)
        return "Mật khẩu xác nhận không khớp.";
      return null;
      
    };
  
    const handleSubmit = async () => {
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }
  
      setLoading(true);
      setError("");
      setSuccess("");
  
      try {
        const { data } = await registerApi({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          // phone là optional, chỉ gửi nếu user có điền
          ...(form.phone.trim() && { phone: form.phone.trim() }),
        });
  
        // API trả về { status: false, message: "..." } khi lỗi nghiệp vụ
        if (!data.status) {
          setError(data.message || "Đăng ký thất bại.");
          return;
        }
  
        // Đăng ký thành công → hiện thông báo, KHÔNG tự login
        // Vì backend yêu cầu verify email trước khi đăng nhập được
        setSuccess(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập."
        );
      } catch (err) {
        setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="form-box">
            <h2>Đăng ký tài khoản</h2>
            <p className="page-subtitle">
              Tạo tài khoản mới để mua hàng nhanh hơn và theo dõi đơn hàng dễ
              hơn.
            </p>

            {/* Thông báo lỗi */}
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            {/* Thông báo thành công */}
            {success && (
              <div className="alert alert-success py-2" role="alert">
                {success}
                <div className="mt-2">
                  <Link to="/login" className="btn btn-sm btn-outline-success">
                    Đi tới đăng nhập
                  </Link>
                </div>
              </div>
            )}
            {/* Ẩn form sau khi đăng ký thành công */}
            {!success && (
              <>
                <div className="mb-3">
                  <label className="form-label">
                    Họ và tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    placeholder="Nhập họ và tên"
                    value={form.fullName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label">
                    Số điện thoại{" "}
                    <span className="text-muted small">(không bắt buộc)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="Nhập số điện thoại"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu"
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
                    placeholder="Nhập lại mật khẩu"
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
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Đang đăng ký...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </button>
              </>
            )}

            <p className="mt-3 mb-0 text-center">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
