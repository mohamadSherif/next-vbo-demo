'use client';

import { ParsedVBOFile } from 'vbo-reader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { useMemo, useState, useCallback } from 'react';

interface DataDisplayProps {
  data: ParsedVBOFile;
}


export default function DataDisplay({ data }: DataDisplayProps) {
  // Debug: Log the first few data points to see what we're working with
  console.log('First 5 data points:', data.data.slice(0, 5));
  
  // Helper function to parse coordinates from string format like "31°19'5.9838\"N"
  const parseCoordinate = (coord: string | number): number => {
    if (typeof coord === 'number') return coord;
    
    try {
      // Parse degrees°minutes'seconds"direction format
      const match = coord.match(/(\d+)°(\d+)'([\d.]+)"([NSEW])/);
      if (!match) return 0;
      
      const [, degrees, minutes, seconds, direction] = match;
      let decimal = parseInt(degrees) + parseInt(minutes) / 60 + parseFloat(seconds) / 3600;
      
      // Apply negative value for South or West
      if (direction === 'S' || direction === 'W') {
        decimal = -decimal;
      }
      
      return decimal;
    } catch (e) {
      console.error('Error parsing coordinate:', coord, e);
      return 0;
    }
  };
  
  // Convert all coordinates to numeric values
  const numericCoordinates = data.data.map(point => ({
    ...point,
    latitude: parseCoordinate(point.latitude),
    longitude: parseCoordinate(point.longitude)
  }));
  
  // Filter out invalid coordinates
  const validCoordinates = numericCoordinates.filter(
    point => 
      point.latitude !== 0 && 
      point.longitude !== 0 &&
      !isNaN(point.latitude) && 
      !isNaN(point.longitude)
  );
  
  // Debug: Log the number of valid coordinates found
  console.log('Valid coordinates found:', validCoordinates.length);
  if (validCoordinates.length > 0) {
    console.log('First valid coordinate:', validCoordinates[0]);
  }

  // Calculate center of the map if we have valid coordinates
  const mapCenter = validCoordinates.length > 0 
    ? [
        validCoordinates.reduce((sum, point) => sum + point.latitude, 0) / validCoordinates.length,
        validCoordinates.reduce((sum, point) => sum + point.longitude, 0) / validCoordinates.length
      ] as [number, number]
    : [0, 0] as [number, number];

  // Convert coordinates to format needed for Google Maps
  const routePoints = validCoordinates.map(point => ({
    lat: point.latitude,
    lng: point.longitude
  }));
  
  // Get start and end points if available
  const startPoint = routePoints.length > 0 ? routePoints[0] : null;
  const endPoint = routePoints.length > 1 ? routePoints[routePoints.length - 1] : null;
  
  // Google Maps container style
  const mapContainerStyle = useMemo(() => ({
    width: '100%',
    height: '400px'
  }), []);
  
  // Google Maps options
  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
  }), []);
  
  // Google Maps center
  const center = useMemo(() => {
    if (validCoordinates.length === 0) {
      return { lat: 0, lng: 0 };
    }
    
    return {
      lat: validCoordinates.reduce((sum, point) => sum + point.latitude, 0) / validCoordinates.length,
      lng: validCoordinates.reduce((sum, point) => sum + point.longitude, 0) / validCoordinates.length
    };
  }, [validCoordinates]);
  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-8">
      {/* Map with Route Trace */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">GPS Route Map</h2>
        <div className="h-96 w-full">
          {validCoordinates.length > 0 ? (
            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                options={mapOptions}
              >
                {/* Route polyline */}
                <Polyline
                  path={routePoints}
                  options={{
                    strokeColor: '#3b82f6',
                    strokeOpacity: 1,
                    strokeWeight: 3,
                  }}
                />
                
                {/* Start marker */}
                {startPoint && (
                  <Marker
                    position={startPoint}
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                      scaledSize: typeof window !== 'undefined' && window.google ? 
                        new window.google.maps.Size(40, 40) : undefined
                    }}
                    title="Start Point"
                  />
                )}
                
                {/* End marker */}
                {endPoint && (
                  <Marker
                    position={endPoint}
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      scaledSize: typeof window !== 'undefined' && window.google ? 
                        new window.google.maps.Size(40, 40) : undefined
                    }}
                    title="End Point"
                  />
                )}
              </GoogleMap>
            </LoadScript>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
              <p className="text-gray-500">No valid GPS coordinates found in the data</p>
            </div>
          )}
        </div>
      </div>

      {/* Velocity Graph */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Velocity Graph</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.data.map((row, index) => ({
                index,
                time: row.time,
                velocity: row.velocity
              }))}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Velocity (km/h)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} km/h`, 'Velocity']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="velocity" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name="Velocity"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Header Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">File Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Creation Date</p>
            <p className="font-medium">{data.header.creationDate.toISOString()}</p>
          </div>
          {data.header.vboxInfo.version && (
            <div>
              <p className="text-sm text-gray-500">VBOX Version</p>
              <p className="font-medium">{data.header.vboxInfo.version}</p>
            </div>
          )}
          {data.header.vboxInfo.gpsType && (
            <div>
              <p className="text-sm text-gray-500">GPS Type</p>
              <p className="font-medium">{data.header.vboxInfo.gpsType}</p>
            </div>
          )}
          {data.header.vboxInfo.serialNumber && (
            <div>
              <p className="text-sm text-gray-500">Serial Number</p>
              <p className="font-medium">{data.header.vboxInfo.serialNumber}</p>
            </div>
          )}
          {data.header.vboxInfo.logRate > 0 && (
            <div>
              <p className="text-sm text-gray-500">Log Rate</p>
              <p className="font-medium">{data.header.vboxInfo.logRate} Hz</p>
            </div>
          )}
          {data.header.vboxInfo.softwareVersion && (
            <div>
              <p className="text-sm text-gray-500">Software Version</p>
              <p className="font-medium">{data.header.vboxInfo.softwareVersion}</p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {data.header.comments && data.header.comments.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">Comments</h3>
            <ul className="space-y-2">
              {data.header.comments.map((comment, index) => (
                <li key={index} className="text-gray-700">{comment}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Channel Units */}
        {data.header.channelUnits && data.header.channelUnits.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">Channel Units</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.header.columnNames.map((name, index) => (
                <div key={index}>
                  <p className="text-sm text-gray-500">{name}</p>
                  <p className="font-medium">{data.header.channelUnits?.[index] || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6 pb-4">Data Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satellites
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latitude
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Longitude
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Velocity (km/h)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heading
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Height (m)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.satellites.count} {row.satellites.hasDGPS && '(DGPS)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof row.latitude === 'number' ? row.latitude.toFixed(6) : row.latitude}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof row.longitude === 'number' ? row.longitude.toFixed(6) : row.longitude}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof row.velocity === 'number' ? row.velocity.toFixed(2) : row.velocity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof row.heading === 'number' ? row.heading.toFixed(2) : row.heading}°
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof row.height === 'number' ? row.height.toFixed(2) : row.height}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t">
          <p className="text-sm text-gray-500">
            Total Records: {data.data.length}
          </p>
        </div>
      </div>
    </div>
  );
}
