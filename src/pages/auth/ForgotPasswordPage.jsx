import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await forgotPasswordApi(email.trim());
      if (!data.status) {
        setError(data.message || "Gửi email thất bại.");
        return;
      }
      setSuccess(
        "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn."
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
        <div className="col-lg-5 col-md-7">
          <div className="form-box">
            <h2>Quên mật khẩu</h2>
            <p className="page-subtitle">
              Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
            </p>

            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            {success ? (
              <div className="alert alert-success py-2" role="alert">
                {success}
                <div className="mt-2">
                  <Link to="/login" className="btn btn-sm btn-outline-success">
                    Về đăng nhập
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Nhập email đã đăng ký"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
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
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi email đặt lại mật khẩu"
                  )}
                </button>
              </>
            )}

            <p className="mt-3 mb-0 text-center">
              <Link to="/login">← Quay lại đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
