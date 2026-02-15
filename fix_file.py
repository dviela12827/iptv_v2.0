import os

file_path = 'c:/Users/Adalmir/Desktop/apenas teste/redflix/src/app/dashred/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix the KPI grid closing div (if still needed, but I think I already fixed it)
# Actually, I'll just find the line with '))' and check if the next line is </div></div>
for i in range(len(lines)):
    if '))} ' in lines[i]:
        if '</div>' not in lines[i+1]:
            # This is where 591 should close
             pass

# Fix the modal closing div
for i in range(len(lines)):
    if ')}' in lines[i] and 'activeTab === \'pix\'' in "".join(lines[i:i+15]):
         # We found the end of the expiring tab modal
         if i > 0 and '</div>' in lines[i-1]:
             # Check if we have 4 closing divs
             count = 0
             for j in range(i-1, i-10, -1):
                 if '</div>' in lines[j]:
                     count += 1
                 else:
                     break
             if count == 3:
                 print(f"Adding missing div at line {i}")
                 lines.insert(i, '                                </div>\n')
                 break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
