import './App.css'
import PCPartsAdmin from './components/PCPartsAdmin'
import Sidebar from './components/SideBar'

function App() {


  return (
    <div className='w-full h-[100vh] flex flex-row items-center justify-center'>

      <div className="flex w-full h-full">
        <Sidebar/>

        {/* Main content area */}
       
      </div>
    </div>
  )
}

export default App
