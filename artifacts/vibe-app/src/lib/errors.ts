export function friendlyError(msg: string): string {
  if (/invalid.*credentials|wrong.*password|incorrect.*password/i.test(msg))
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة، تحقق وحاول مجدداً";
  if (/already.*used|مستخدم بالفعل/i.test(msg))
    return "هذا البريد الإلكتروني مستخدم من حساب آخر";
  if (/already.*exist|email.*taken|duplicate/i.test(msg))
    return "هذا البريد الإلكتروني مسجّل مسبقاً، جرّب تسجيل الدخول أو استعادة كلمة المرور";
  if (/not.*found|no.*user/i.test(msg))
    return "لا يوجد حساب بهذا البريد الإلكتروني، تحقق من البريد أو أنشئ حساباً جديداً";
  if (/network|fetch|connect/i.test(msg))
    return "تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت وحاول مجدداً";
  if (/invalid.*otp|wrong.*otp|otp.*incorrect/i.test(msg))
    return "رمز التحقق غير صحيح، تأكد من الرقم وأنه لم تنته صلاحيته";
  if (/wrong.*password|incorrect.*password|غير صحيحة/i.test(msg))
    return "كلمة المرور الحالية غير صحيحة";
  if (/كبير جداً|413/i.test(msg))
    return "حجم الصورة كبير جداً — اختر صورة أصغر";
  return msg || "حدث خطأ غير متوقع، حاول مجدداً";
}
