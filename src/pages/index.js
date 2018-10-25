import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import Image from '../components/image'

const IndexPage = () => (
  <Layout>
    <h1>AHOY ME HEARTIES</h1>
    <p>Welcome aboard this most exciting ship.</p>
    <p>We love our customers!.</p>
    <div style={{ maxWidth: '300px', marginBottom: '1.45rem' }}>
      <Image />
    </div>
   
  </Layout>
)

export default IndexPage
