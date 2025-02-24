# Создание директорий
$directories = @(
    "src/auth",
    "src/components/dashboard",
    "src/components/admin",
    "src/components/user",
    "src/layouts",
    "src/pages/admin",
    "src/pages/user",
    "src/pages/auth",
    "src/pages",
    "src/services/api",
    "src/services",
    "src/theme",
    "src/utils",
    "src/hooks"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# Создание файлов
$files = @(
    "src/auth/AuthContext.jsx",
    "src/auth/AuthGuard.jsx",
    "src/auth/useAuth.js",
    "src/components/dashboard/DashboardLayout.jsx",
    "src/components/dashboard/NavConfig.jsx",
    "src/components/dashboard/SidebarConfig.jsx",
    "src/components/admin/UserList.jsx",
    "src/components/admin/SignalAssignment.jsx",
    "src/components/admin/AdminDashboard.jsx",
    "src/components/user/SignalStats.jsx",
    "src/components/user/UserProfile.jsx",
    "src/components/user/UserDashboard.jsx",
    "src/layouts/AdminLayout.jsx",
    "src/layouts/UserLayout.jsx",
    "src/layouts/MainLayout.jsx",
    "src/layouts/AuthLayout.jsx",
    "src/pages/admin/UserManagement.jsx",
    "src/pages/admin/SignalManagement.jsx",
    "src/pages/admin/Dashboard.jsx",
    "src/pages/user/Dashboard.jsx",
    "src/pages/user/Profile.jsx",
    "src/pages/user/Signals.jsx",
    "src/pages/auth/Login.jsx",
    "src/pages/auth/Register.jsx",
    "src/pages/auth/ForgotPassword.jsx",
    "src/pages/Home.jsx",
    "src/pages/NotFound.jsx",
    "src/services/api/auth.js",
    "src/services/api/signal.js",
    "src/services/api/user.js",
    "src/services/axios.js",
    "src/services/localStorage.js",
    "src/theme/index.js",
    "src/theme/palette.js",
    "src/theme/typography.js",
    "src/theme/shadows.js",
    "src/utils/formatNumber.js",
    "src/utils/formatDate.js",
    "src/utils/validate.js",
    "src/hooks/useResponsive.js",
    "src/hooks/useSettings.js",
    "src/routes.js",
    "src/App.jsx",
    "src/main.jsx"
)

foreach ($file in $files) {
    New-Item -ItemType File -Path $file -Force | Out-Null
}
