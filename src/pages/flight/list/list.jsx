import { View, ScrollView, Block, Text, Image, Picker } from "@tarojs/components";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import Skeleton from 'taro-skeleton'
import 'taro-skeleton/dist/index.css'

import './list.scss'

import { formatDateList } from "@/common/utils";
import { useEffect, useState } from "react";

// api
import { airTicketListReq } from "@/common/api";
import tools from "@/common/tools";



let oriFlightData;

export default function FLightList() {
  // 航班信息
  const [flightData, setFlightData] = useState({})

  // 日期信息
  const [dateList, setDateList] = useState([])
  // 机票信息
  const [flightList, setFlightList] = useState([])

  useEffect(() => {
    // 获取路由参数并存储
    const { params } = getCurrentInstance().router
    const {
      arrAirportName,
      arrCityId,
      arrCityName,
      cityType,
      dptAirportName,
      dptCityId,
      dptCityName,
      dptDate } = params
    setFlightData({
      arrAirportName,
      arrCityId,
      arrCityName,
      cityType,
      dptAirportName,
      dptCityId,
      dptCityName,
      dptDate
    })

    // 修改页面标题
    Taro.setNavigationBarTitle({
      title: `${dptCityName} - ${arrCityName}`
    })

    // 设置顶部日历信息
    setDateList(formatDateList())

  }, [])

  // 获取机票数据
  useEffect(() => {
    getTicketList()
  }, [flightData])

  // 请求机票数据
  function getTicketList() {
    // console.log('flightData', flightData)
    tools.showLoading()
    setScrollTop('')
    airTicketListReq(flightData).then(res => {
      setFlightList(res.result)
      oriFlightData = res.result
      const companyList = Array.from(new Set(res.result.map(item => item.airCompanyName)))
      setFlightCompanyList(companyList)
      setScrollTop(0)
    }).catch(err => {
      console.log('airTicketListReq_err', err)
    }).finally(() => {
      tools.hideLoading()
    })
  }

  // 用户点击选择日期
  function chooseDate(date) {
    setFlightData({
      ...flightData,
      dptDate: date
    })
    // 重新请求数据
    getTicketList()
  }

  // 跳转详情
  function onFlightClick(flight) {
    console.log('onFlightClick', flight)
    tools.navigateTo({
      url: '/pages/flight/detail/detail',
      data: {...flight}
    })
  }

  // 航司列表
  const [flightCompanyList, setFlightCompanyList] = useState([])
  // 当前选中的航班公司
  const [currentAirCompony, setCurrentAirCompany] = useState('')
  // 置顶
  const [scrollTop, setScrollTop] = useState('')

  function handleChooseCompany(e) {
    const index = e.detail.value
    setCurrentAirCompany(index)
    const targetCompany = flightCompanyList[index]
    const newFlightList = oriFlightData.filter(item => item.airCompanyName === targetCompany)
    setFlightList(newFlightList)
    // 列表重新置顶
    setScrollTop('')
    setTimeout(() => {
      setScrollTop(0)
    })
  }

  return <View className="list-container">
    <View  className="calendar-list">
      <ScrollView             className="calendar-scroll-list"
        scrollX
        scrollWithAnimation
        scrollIntoView={`date-${flightData.dptDate}`}
      >
        {
          dateList.map(date => (
            <View
              key={date.dateStr}
              className={`item ${
                date.dateStr === flightData.dptDate ? "cur" : ""
              }`}
              id={`date-${date.dateStr}`}
              onClick={() => chooseDate(date.dateStr)}
            >
              <View className="date">{ date.day }</View>
              <View className="week">{ date.week }</View>
            </View>
          ))
        }
      </ScrollView>
    </View>
    {
      flightList.length ? (<View id="flight-list">
        <ScrollView className="flight-scroll-list" scrollY scrollTop={scrollTop}>
          {flightList?.map((flight, index) => {
            const {                   dptAirportName,
              dptTimeStr,
              arrTimeStr,
              arrAirportName,
              airIcon,
              airCompanyName,
              price, } = flight


            return (
              <Block key={flight.id}>
                {
                  index === 3 && (
                    <View className="notice">
                      <Image className="notice-logo" src="https://images3.c-ctrip.com/ztrip/xiaochengxu/shangzhang_zx.png"></Image>
                      <Text className="notice-text">价格可能会上涨，建议尽快预定</Text>
                    </View>
                  )
                }
                <View
                  className="list-item"
                  onClick={() => onFlightClick(flight)}
                >
                  <View className="item-price">
                    <View className="flight-row">
                      <View className="depart">
                        <Text className="flight-time">{dptTimeStr}</Text>
                        <Text className="airport-name">
                          {dptAirportName}
                        </Text>
                      </View>
                      <View className="separator">
                        <View className="spt-arr"></View>
                      </View>
                      <View className="arrival">
                        <Text className="flight-time">{arrTimeStr}</Text>
                        <Text className="airport-name">
                          {arrAirportName}
                        </Text>
                      </View>
                    </View>
                    <Text className="flight-price color-red">
                                ¥ {price}
                    </Text>
                  </View>
                  <View className="air-info">
                    <Image className="logo" src={airIcon} />
                    <Text className="company-name">{airCompanyName}</Text>
                  </View>
                </View>
              </Block>
            )
          })}
        </ScrollView>
      </View>) : (
        <View className="skeleton-box">
          {
            Array(7).fill(0).map((item, index) => (
              <Skeleton key={index} row={3} action rowHeight={34}>
              </Skeleton>
            ))
          }
        </View>
      )
    }
    {/* 筛选器 */}
    <Picker className="filter-btn" range={flightCompanyList} value={currentAirCompony} onChange={(e) => handleChooseCompany(e)}>
    筛选
    </Picker>
  </View>
}
