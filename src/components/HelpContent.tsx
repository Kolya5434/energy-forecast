import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HubIcon from '@mui/icons-material/Hub';
import ScienceIcon from '@mui/icons-material/Science';
import TocIcon from '@mui/icons-material/Toc';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Stack
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';

export const HelpContent = () => {
  const model_id = 'XGBoost_Tuned';
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 0, overflowY: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, minHeight: '100%', backgroundColor: 'background.paper' }}>
        <Typography variant="h5">Довідка та Опис Модулів</Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="body1" sx={{ mb: 3 }}>
          Ця сторінка пояснює призначення та функціонал кожної вкладки вашої аналітичної платформи, як це показано на
          навігаційній панелі.
        </Typography>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ShowChartIcon color="primary" />
              <Typography variant="h6">Графік Прогнозів</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Це головний екран платформи, призначений для візуалізації та порівняння прогнозів моделей.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Панель керування (зліва)"
                  secondary="Дозволяє вибрати одну або декілька моделей зі списку (напр., 'XGBoost_Tuned', 'SARIMA'), вказати горизонт прогнозування та запустити розрахунок кнопкою 'Сформувати прогноз'."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Основна область (центр)"
                  secondary="Відображає інтерактивний графік, де кожна лінія відповідає прогнозу обраної моделі. Дозволяє візуально оцінити різницю між моделями."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Вибір типу графіка (справа)"
                  secondary="Дозволяє миттєво перемикати візуалізацію між різними типами графіків, такими як 'Лінійна', 'Стовпчаста' або 'Area'."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BarChartIcon color="primary" />
              <Typography variant="h6">Порівняння (Evaluation)</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Ця вкладка призначена для глибокого, об'єктивного аналізу та порівняння ефективності моделей за ключовими
              критеріями. Вона динамічно викликає ендпоінт `/api/evaluation/{model_id}`.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Таблиця метрик"
                  secondary="Зведена таблиця з усіма ключовими метриками: точність (MAE, RMSE, R²), продуктивність (Latency, Memory). Дозволяє сортувати та підсвічує найкращі/найгірші значення."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Графік порівняння"
                  secondary="Візуалізує ті ж метрики у вигляді стовпчастої, лінійної або area-діаграми для наочного порівняння."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <HubIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Аналіз помилок"
                  secondary="Дозволяє візуально оцінити, де і як помиляється ОДНА вибрана модель: графік залишків у часі, розподіл помилок по місяцях (Box Plot) та графік 'Факт vs Прогноз'."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <HubIcon color="primary" />
              <Typography variant="h6">Аналіз важливості ознак</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Ця вкладка відповідає на питання: "Чому ML-модель зробила такий прогноз?". Вона викликає `GET
              /api/interpret/{model_id}`.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Графік важливості ознак"
                  secondary="Показує, які вхідні дані (наприклад, 'day_of_week' або 'Sub_metering_3') мали найбільший вплив на результат роботи моделі. Дозволяє вибрати модель та кількість ознак (Топ-N)."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Таблиця важливості"
                  secondary="Дозволяє переглянути ті ж дані у вигляді таблиці та експортувати їх у XLSX, PDF або DOCX."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ScienceIcon color="primary" />
              <Typography variant="h6">Симуляція (What-If)</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              "Вау-фіча", що демонструє практичну цінність моделі. Вона дозволяє вам "гратися" з майбутніми даними,
              викликаючи `POST /api/simulate`.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Форма керування"
                  secondary="Дозволяє вибрати модель, горизонт прогнозування та вручну змінити одну з ознак для конкретної дати (напр., змінити 'day_of_week' на '6' для симуляції свята)."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Графік симуляції"
                  secondary="Відображає дві лінії: 'Базовий прогноз' (що було б без змін) та 'Симульований прогноз' (що сталося після змін). Це наочно показує, як модель реагує на зміну вхідних факторів."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <HubIcon color="primary" />
              <Typography variant="h6">Візуалізація SHAP Force Plot</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Найглибший рівень аналізу, який пояснює **один конкретний прогноз**. Він показує:</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Базове значення (Base Value)"
                  secondary="Середній прогноз моделі по всіх даних."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Внески ознак (Feature Contributions)"
                  secondary="Червоні та сині стрілки показують, які саме ознаки (напр., 'day_of_week') 'штовхали' прогноз вгору (підвищували споживання) або вниз (знижували) відносно базового значення."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <TocIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Фінальний прогноз (Prediction)"
                  secondary="Результат, що дорівнює сумі базового значення та всіх внесків."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};
