'use client';

import { ParsedVBOFile } from 'vbo-reader';

interface DataDisplayProps {
  data: ParsedVBOFile;
}

export default function DataDisplay({ data }: DataDisplayProps) {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-8">
      {/* Header Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">File Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Creation Date</p>
            <p className="font-medium">{data.header.creationDate.toLocaleString()}</p>
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
