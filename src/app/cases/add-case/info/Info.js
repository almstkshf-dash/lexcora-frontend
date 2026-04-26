import Bar from "./Bar"
import Branch from "./Branch"
import CaseClassifications from "./CaseClassifications"
import CaseType from "./CaseType"
import Files from "./Files"
import Inputs from "./Inputs"

function Info() {
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-8">
        {/* Top Bar / Settings */}
        <Bar />
        
        {/* Main Grid for Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CaseType />
          <CaseClassifications />
          <Branch />
          <Inputs />
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <Files />
      </div>
    </div>
  )
}

export default Info