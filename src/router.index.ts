import { createRouter, createWebHistory } from "vue-router";

import CartView from "../views/CartView.vue";
import api from "../services/api";
import AdminLayout from "../layouts/AdminLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/programs/:id",
      name: "program-detail",
      component: () => import("../views/ProgramDetailView.vue"),
    },
    {
      path: "/courses/:id",
      name: "course-detail",
      component: () => import("../views/CourseDetailView.vue"),
    },
    {
      path: "/products/:slug",
      name: "product-detail",
      component: () => import("../views/ProductDetailView.vue"),
    },
    {
      path: "/checkout",
      name: "checkout",
      component: () => import("../views/CheckoutView.vue"),
    },
    {
      path: "/cart",
      name: "cart",
      component: CartView,
    },

    {
      path: "/admin/login",
      name: "AdminLogin",
      component: () => import("../views/admin/AdminLoginView.vue"),
      meta: { guestOnly: true },
    },

    {
      path: "/admin",
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        {
          path: "",
          name: "AdminDashboard",
          component: () => import("../views/admin/AdminDashboardView.vue"),
        },
        {
          path: "programs",
          name: "AdminPrograms",
          component: () => import("../views/admin/AdminProgramsView.vue"),
        },
        {
          path: "programs/create",
          name: "AdminProgramCreate",
          component: () => import("../views/admin/AdminProgramFormView.vue"),
        },
        {
          path: "programs/:id/edit",
          name: "AdminProgramEdit",
          component: () => import("../views/admin/AdminProgramFormView.vue"),
        },
        {
          path: "courses",
          name: "AdminCourses",
          component: () => import("../views/admin/AdminCoursesView.vue"),
        },
        {
          path: "courses/create",
          name: "AdminCourseCreate",
          component: () => import("../views/admin/AdminCourseFormView.vue"),
        },
        {
          path: "courses/:id/edit",
          name: "AdminCourseEdit",
          component: () => import("../views/admin/AdminCourseFormView.vue"),
        },
        {
          path: "products",
          name: "AdminProducts",
          component: () => import("../views/admin/AdminProductsView.vue"),
        },
        {
          path: "products/create",
          name: "AdminProductCreate",
          component: () => import("../views/admin/AdminProductFormView.vue"),
        },
        {
          path: "products/:id/edit",
          name: "AdminProductEdit",
          component: () => import("../views/admin/AdminProductFormView.vue"),
        },
        {
          path: "orders",
          name: "AdminOrders",
          component: () => import("../views/admin/AdminOrdersView.vue"),
        },
        {
          path: "users",
          name: "AdminUsers",
          component: () => import("../views/admin/AdminUsersView.vue"),
        },
      ],
    },
  ],

  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  },
});

router.beforeEach(async (to) => {
  const token = localStorage.getItem("admin_access_token");

  const requiresAdmin = to.matched.some(
    (record) => record.meta.requiresAdmin === true,
  );

  if (requiresAdmin) {
    if (!token) {
      return {
        name: "AdminLogin",
        query: { redirect: to.fullPath },
      };
    }

    try {
      await api.get("/auth/admin/me");
      return true;
    } catch (error) {
      console.error("Admin authentication failed:", error);
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_user");

      return {
        name: "AdminLogin",
        query: { redirect: to.fullPath },
      };
    }
  }

  if (to.path === "/admin/login" && token) {
    try {
      await api.get("/auth/admin/me");
      return { name: "AdminDashboard" };
    } catch (error) {
      console.error("Stored admin token is invalid:", error);
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_user");
      return true;
    }
  }

  return true;
});

export default router;
