import { Navigate, Route, Routes } from 'react-router'
import { ErrorBoundary } from './ErrorBoundary'
import DashboardPage from './pages/DashboardPage'
import FeedPage from './pages/FeedPage'
import HistoryDetailPage from './pages/HistoryDetailPage'
import IndexPage from './pages/IndexPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import MyOrdersPage from './pages/MyOrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import OrdererReviewsPage from './pages/OrdererReviewsPage'
import PostOrderPage from './pages/PostOrderPage'
import ProfilePage from './pages/ProfilePage'
import RatingPage from './pages/RatingPage'
import RegisterPage from './pages/RegisterPage'
import RunnerEarningsPage from './pages/RunnerEarningsPage'
import RunnerReviewsPage from './pages/RunnerReviewsPage'

const routes = [
  { id: "dashboard", Component: DashboardPage },
  { id: "feed", Component: FeedPage },
  { id: "history-detail", Component: HistoryDetailPage },
  { id: "index", Component: IndexPage },
  { id: "landing", Component: LandingPage },
  { id: "login", Component: LoginPage },
  { id: "my-orders", Component: MyOrdersPage },
  { id: "order-detail", Component: OrderDetailPage },
  { id: "order-tracking", Component: OrderTrackingPage },
  { id: "orderer-reviews", Component: OrdererReviewsPage },
  { id: "post-order", Component: PostOrderPage },
  { id: "profile", Component: ProfilePage },
  { id: "rating", Component: RatingPage },
  { id: "register", Component: RegisterPage },
  { id: "runner-earnings", Component: RunnerEarningsPage },
  { id: "runner-reviews", Component: RunnerReviewsPage },
]

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/index" element={<IndexPage />} />
        <Route path="/index.html" element={<IndexPage />} />

        {routes
          .filter(({ id }) => id !== 'index')
          .map(({ id, Component }) => (
            <Route key={id} path={`/${id}`} element={<Component />} />
          ))}

        {routes
          .filter(({ id }) => id !== 'index')
          .map(({ id, Component }) => (
            <Route key={`${id}.html`} path={`/${id}.html`} element={<Component />} />
          ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
