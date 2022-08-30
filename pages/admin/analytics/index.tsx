import type { NextPage } from 'next'
import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import { Layout } from '../../../components/Layout'
import { StyledAnalytics } from '../../../components/Admin/Analytics/Analytics.Styled'
import { mailman } from '../../../backend/utils/mailman'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../redux/user'
import { Skeleton } from '../../../components/System/Skeleton'
import { UserType } from '../../../types'
import { CountItem } from '../../../components/Admin/Analytics/CountItem'
import { ListItem } from '../../../components/Admin/Analytics/ListItem'
import { NotAuthenticated } from '../../../components/ErrorViews/NotAuthenticated'
import { Head } from '../../../components/Head'

const StyledHeader = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
`

type AnalyticsType = {
  counts: [{ title: string; count: number }]
  recentUsers: UserType[]
}

const AnalyticsPage: NextPage = () => {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsType>()
  const user = useSelector(selectUser)

  const loadAnalytics = async () => {
    setLoading(true)

    const {
      status,
      res: { data },
    } = await mailman('analytics', 'GET')

    setAnalytics(data)

    setLoading(false)
  }

  const getRandomLocation = async () => {
    const fetchConfig = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    const test = await fetch('https://jsonplaceholder.typicode.com/posts', fetchConfig)
    const test2 = await test.json()

    console.log(test2)

    /*
    const sv = new window.google.maps.StreetViewService()

    // Try to find a panorama within 50 metres
    sv.getPanorama(
      {
        location: { lat, lng },
        radius: 50,
      },
      callback
    )
    */
  }
  useEffect(() => {
    // HALP - add server side validation for isAdmiin
    //loadAnalytics()
    getRandomLocation()
  }, [])

  return (
    <Layout>
      <Head title="Analytics" />
      <StyledHeader>Analytics</StyledHeader>

      <StyledAnalytics>
        <div className="analytics-group ">
          {loading &&
            Array(4)
              .fill(0)
              .map((_, idx) => <Skeleton key={idx} />)}
          {!loading &&
            analytics?.counts.map((countItem, idx) => (
              <CountItem key={idx} title={countItem.title} count={countItem.count} />
            ))}
        </div>

        <div className="analytics-group ">
          {loading &&
            Array(2)
              .fill(0)
              .map((_, idx) => (
                <div key={idx} className="skeleton-group-item">
                  <div className="skeleton-heading">
                    <Skeleton key={idx} variant="rectangular" height={16} width={200} />
                  </div>
                  <div className="skeleton-data">
                    {Array(5)
                      .fill(0)
                      .map((_, idx) => (
                        <div className="skeleton-user-item" key={idx}>
                          <div className="skeleton-user-details">
                            <Skeleton key={idx} variant="circular" height={30} width={30} />
                            <Skeleton key={idx} variant="rectangular" height={16} width={100} />
                          </div>
                          <div className="skeleton-user-created-date">
                            <Skeleton key={idx} variant="rectangular" height={16} width={200} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          {!loading && (
            <>
              <ListItem title="New Users" data={analytics?.recentUsers as UserType[]} />
              <ListItem title="New Users" data={analytics?.recentUsers as UserType[]} />
            </>
          )}
        </div>
      </StyledAnalytics>
    </Layout>
  )
}

export default AnalyticsPage