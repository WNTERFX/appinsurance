
import { BarChart } from '@mui/x-charts/BarChart';
import FilterModerator from './FilterModerator';
import MonthlyDataPartnersModerator from './MonthlyDataPartnersModerator';
import './moderator-styles/monthly-styles-moderator.css';

export default function MonthlyDataModerator() {

 
    return (

        <div className="monthly-data-container-moderator">
            <div className="monthly-data-header-moderator">
                <p>Monthly Data</p>
                <input
                    type="text"
                    className="monthly-data-search-moderator"
                    placeholder="Search clients..."
                />

                <div>
                   <FilterModerator />
                </div>
            </div>

            <div className="data-area-moderator">
                  <MonthlyDataPartnersModerator /> 
            </div>
           

            <div className="graph-container-moderator">
                <p>Insurance</p>
                <div className="graph-moderator">
                   <BarChart
                           xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
                           series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
                           height={200}
                           width={1000}
                        />    
                </div>
            </div>
        </div>
    );

}