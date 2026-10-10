import { createRouter, createWebHistory } from "vue-router";
import CartView from "../views/CartView.vue";

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
  ],

  scrollBehavior() {
    return {
      top: 0,
      behavior: "smooth",
    };
  },
});

export default router;
