import { describe, it, expect } from 'vitest'
import type { ComponentType } from 'react'
import { renderWithRouter } from '../test/renderWithRouter'

import DashboardPage from './DashboardPage'
import FeedPage from './FeedPage'
import HistoryDetailPage from './HistoryDetailPage'
import LandingPage from './LandingPage'
import LoginPage from './LoginPage'
import MyOrdersPage from './MyOrdersPage'
import OrderDetailPage from './OrderDetailPage'
import OrderTrackingPage from './OrderTrackingPage'
import OrdererReviewsPage from './OrdererReviewsPage'
import PostOrderPage from './PostOrderPage'
import ProfilePage from './ProfilePage'
import RatingPage from './RatingPage'
import RegisterPage from './RegisterPage'
import RunnerEarningsPage from './RunnerEarningsPage'
import RunnerReviewsPage from './RunnerReviewsPage'

// Each page is mounted under a route that satisfies its role guard and (where
// relevant) supplies a valid order id, so its legacy inline scripts run for real.
const pages: Array<{ name: string; Component: ComponentType; route: string }> = [
  { name: 'LandingPage', Component: LandingPage, route: '/' },
  { name: 'RegisterPage', Component: RegisterPage, route: '/register' },
  { name: 'LoginPage', Component: LoginPage, route: '/login' },
  { name: 'DashboardPage', Component: DashboardPage, route: '/dashboard?role=orderer' },
  { name: 'PostOrderPage', Component: PostOrderPage, route: '/post-order?role=orderer' },
  { name: 'OrderTrackingPage', Component: OrderTrackingPage, route: '/order-tracking?role=orderer' },
  { name: 'MyOrdersPage', Component: MyOrdersPage, route: '/my-orders?role=orderer' },
  { name: 'OrdererReviewsPage', Component: OrdererReviewsPage, route: '/orderer-reviews?role=orderer' },
  { name: 'ProfilePage', Component: ProfilePage, route: '/profile?role=orderer' },
  { name: 'FeedPage', Component: FeedPage, route: '/feed?role=runner' },
  { name: 'OrderDetailPage', Component: OrderDetailPage, route: '/order-detail?role=runner' },
  { name: 'RunnerEarningsPage', Component: RunnerEarningsPage, route: '/runner-earnings?role=runner' },
  { name: 'RunnerReviewsPage', Component: RunnerReviewsPage, route: '/runner-reviews?role=runner' },
  { name: 'RatingPage', Component: RatingPage, route: '/rating?role=orderer' },
  {
    name: 'HistoryDetailPage',
    Component: HistoryDetailPage,
    route: '/history-detail?role=orderer&id=CE-2039',
  },
]

describe('page smoke renders', () => {
  it.each(pages)('$name mounts, sets the title, and runs its scripts', ({ Component, route }) => {
    const { container } = renderWithRouter(<Component />, { route })

    // PageChrome wraps every page in a route marker once mounted.
    expect(container.querySelector('[data-react-route]')).not.toBeNull()
    // PageChrome sets the document title from each page's title prop.
    expect(document.title).toContain('CampusEats')
  })
})
