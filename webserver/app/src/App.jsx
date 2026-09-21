import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore';
import { useProductStore } from './stores/productStore';
import { useAuthStore } from './stores/authStore';
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import TooManyRequests from './pages/TooManyRequests';
import Checkout from './pages/Checkout';
import SuccessCheckout from './pages/SuccessCheckout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Faq from './pages/Faq';
import Settings from './pages/Settings';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import SellerProfile from './pages/SellerProfile';
import Messagerie from './pages/Messagerie';
import Login from './pages/Login';
import ProductDetail from './pages/ProduitDetail';
import Produits from './pages/Produits';
import './styles/style.css';
import './styles/tokens.css';
import { useLanguageStore, dynamicActivate } from './stores/languageStore';
import Unavailable from './pages/Unavailable';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

function App() {
    const theme = useThemeStore((state) => state.theme);
    const initAuth = useAuthStore((state) => state.initAuth);
    const locale = useLanguageStore((state) => state.locale);
    const initializing = useAuthStore((state) => state.initializing);
    const [i18nReady, seti18nReady] = useState(false);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    useEffect(() => {
        dynamicActivate(locale).then(() => seti18nReady(true));
    }, [locale]);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        useProductStore.getState().fetchProducts();
    }, []);

    if (initializing || !i18nReady) {
        return null;
    }

    return (
        <I18nProvider i18n={i18n}>
            <Router>
                <ScrollToTop />
                <Routes>
                    {/* Routes avec Navbar/Footer */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Produits />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/messagerie" element={<Messagerie />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/profile/:id" element={<SellerProfile />} />
                        <Route path="/confidentialite" element={<PrivacyPolicy />} />
                        <Route path="/conditions-generales" element={<TermsOfService />} />
                        <Route path="/faq" element={<Faq />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/orders" element={<Orders />} />
                    </Route>

                    {/* Routes sans Navbar/Footer */}
                    <Route element={<AuthLayout />}>
                        <Route path="/authentication" element={<Login />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/checkout/success" element={<SuccessCheckout />} />
                    </Route>

                    <Route path="/rate-limiting" element={<TooManyRequests />} />
                    <Route path="/Unavailable" element={<Unavailable />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </I18nProvider>
    );
}

export default App;