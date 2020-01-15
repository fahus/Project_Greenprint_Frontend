import React from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie
} from 'recharts';
import './profile.css';
import { userService } from '../services/authentication.service'

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { journeys: null }
  }

  componentDidMount() {
    const userId = userService.decodeTokenGetId()
    fetch(`https://cors-anywhere.herokuapp.com/https://project-greenprint-backend.herokuapp.com/travel/record/user/${userId}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      })
      .then(data => data.json())
      .then(body => {
        this.setState({journeys: body.data});
      })
    }

    distanceByMode(cyclingDistance, drivingDistance, transitDistance, walkingDistance) {
      return this.state.journeys.forEach(
        function(elem) {
          if(elem.mode === "bicycling"){
            cyclingDistance.value += elem.distance
          } else if (elem.mode === "driving") {
            drivingDistance.value += elem.distance
          } else if (elem.mode === "transit") {
            transitDistance.value += elem.distance
          } else if (elem.mode === "walking") {
            walkingDistance.value += elem.distance
          }
        }
      )
    }

    carbonPerJourney(journeys) {
      return journeys.reduce(function(result, journey) {
        if (journey.mode !== "bicycling" && journey.mode !== "walking")
          result.push({ name:journey.date.slice(0, 10), carbon:journey.carbon })
        return result;
      }, []);
    }

    carbonByMode(transitCarbon, drivingCarbon) {
      return this.state.journeys.forEach(
        function(elem) {
          if(elem.mode === "transit"){
            transitCarbon.carbon += elem.carbon
        } else if (elem.mode === "driving"){
            drivingCarbon.carbon += elem.carbon
        }
      })
    }

    render() {
      if (!this.state.journeys) {
        return <div />
      } else if ( this.state.journeys.length === 0 ) {
        return <h2>You haven't made any journeys yet, please visit 'Home' to do this!</h2>
      } else {
        const cyclingDistance = {name: 'Cycling', value: 0};
        const drivingDistance = {name: 'Driving', value: 0};
        const transitDistance = {name: 'Public transport', value: 0};
        const walkingDistance = {name: 'Walking', value: 0};

        const transitCarbon = {name: 'Public transport', carbon:0};
        const drivingCarbon = {name: 'Driving', carbon: 0};

        const barData = this.carbonPerJourney(this.state.journeys);

        this.distanceByMode(cyclingDistance, drivingDistance, transitDistance, walkingDistance);
        const pieData = [cyclingDistance, drivingDistance, transitDistance, walkingDistance];

        this.carbonByMode(transitCarbon, drivingCarbon);
        const verticalChartData = [transitCarbon, drivingCarbon]

        return (
          <div>
          <h1>My Journeys Dashboard</h1>
            <div id="barchart">
            <h2>Carbon(kg) per journey taken by rail or car</h2>
              <BarChart width={600} height={300} data={barData}
                margin={{top: 10, right: 10, left: 100, bottom: 30}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis />
                <Tooltip/>
                <Legend />
                <Bar dataKey="carbon" fill="#8884d8" />
              </BarChart>
            </div>
            <div id="piechart">
              <h2>Distance(miles) travelled by mode of transport</h2>
              <PieChart width={800} height={300}>
                <Pie isAnimationActive={true} data={pieData} cx={400} cy={150} outerRadius={100} fill="#8884d8" label/>
                <Tooltip/>
              </PieChart>
            </div>
            <div id="sidebar">
              <h2>Total carbon(kg) by mode of transport</h2>
              <BarChart layout="vertical" width={600} height={300} data={verticalChartData}
                margin={{top: 10, right: 30, left: 100, bottom: 30}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis type="number"/>
                <YAxis type="category" dataKey="name"/>
                <Tooltip/>
                <Legend />
                <Bar dataKey="carbon" fill="#8884d8" />
              </BarChart>
            </div>
            <div id="recommendations">
              <h2>Some things you can do to offset your carbon emmissions..</h2>
              <p> Invest in carbon offsetting projects like this one:
                <a href="https://www.carbonfootprint.com/carbonoffsetprojects.html"> carbonfootprint.com</a>
               </p>
            </div>
          </div>
        );
      }
    }
  }


  export default Profile;